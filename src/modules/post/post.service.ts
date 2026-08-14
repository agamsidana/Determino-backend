import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { EntityManager, In, Repository, DataSource } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { PaginationQueryDto } from 'src/shared/dto/pagination-query.dto';
import { ReactionType } from './enums/reaction-type.enum';
import { PostReactionEntity } from './entities/post-reaction.entity';
import { HashTagEntity } from './entities/hashtag.entity';
import { PostUploadEntity } from './entities/post-upload.entity';
import { PostAttachmentEntity } from './entities/post-attachment.entity';
import { SupabaseStorageService } from 'src/shared/supabase/supabase-storage.service';
@Injectable()
export class PostService {

    constructor(@InjectRepository(PostEntity) private readonly postRepository: Repository<PostEntity>, @InjectRepository(PostReactionEntity) private readonly postReactionRepository: Repository<PostReactionEntity>, @InjectRepository(HashTagEntity) private readonly hashtagRepository: Repository<HashTagEntity>, @InjectRepository(PostAttachmentEntity) private readonly postAttachmentRepository: Repository<PostAttachmentEntity>, private supabaseStorageService: SupabaseStorageService ,private readonly dataSource: DataSource) { }

    async createPost(userId: string, dto: CreatePostDto) {

        const { title, content, type, hashtags, attachments } = dto;

        return this.dataSource.transaction(async (manager) => {

            const normalizeHashtags = await this.normalizeHashTags(manager, hashtags);

            const uploadIds = attachments?.map(attachment => attachment.uploadId) ?? [];

            const uploads = await manager.find(PostUploadEntity, {
                where: {
                    id: In(uploadIds),
                    userId,
                    isUsed: false
                }
            });

            if (uploads.length !== uploadIds.length) {
                throw new NotFoundException(
                    'One or more attachments are invalid',
                );
            }

            const post = manager.create(PostEntity, {
                title,
                content,
                type,
                hashtags: normalizeHashtags,
                user: {
                    id: userId
                }
            });

            const savedPost = await manager.save(post);

            const postAttachments = uploads.map(upload =>
                manager.create(PostAttachmentEntity, {
                    type: upload.type,
                    storagePath: upload.storagePath,
                    fileName: upload.fileName,
                    mimeType: upload.mimeType,
                    fileSize: upload.fileSize,
                    post: savedPost
                })
            );

            const savedPostAttachments = await manager.save(postAttachments);

            uploads.forEach(upload => upload.isUsed = true);

            await manager.save(uploads);

            return {
                data: {
                    id: savedPost.id,
                    title: savedPost.title,
                    type: savedPost.type,
                    content: savedPost.content,
                    hashtags: normalizeHashtags.map(hashtag => ({
                        id: hashtag.id,
                        name: hashtag.name
                    })),
                    attachments: savedPostAttachments.map(attachment => ({
                        id: attachment.id,
                        type: attachment.type,
                        fileName: attachment.fileName,
                        mimeType: attachment.mimeType,
                        fileSize: attachment.fileSize
                    })),
                    createdAt: savedPost.createdAt
                }
            }

        })

    }


    async getPosts(query: PaginationQueryDto, userId: string) {

        const { page, limit } = query;
        const skip = (page - 1) * limit;

        const queryBuilder = this.postRepository
            .createQueryBuilder('post')

            .leftJoinAndSelect('post.user', 'user')
            .leftJoinAndSelect('user.profile', 'profile')

            .leftJoin(
                'post.reactions',
                'reaction',
                'reaction.type = :reactionType',
                {
                    reactionType: ReactionType.HELPFUL,
                },
            )

            .where('post.isDeleted = :isDeleted', {
                isDeleted: false,
            })

            .addSelect(
                'COUNT(reaction.id)',
                'helpfulCount',
            )

            .addSelect(
                `EXISTS (
        SELECT 1
        FROM post_reactions user_reaction
        WHERE user_reaction."postId" = post.id
            AND user_reaction."userId" = :userId
            AND user_reaction.type = :reactionType
        )`,
                'isHelpful',
            )

            .setParameter('userId', userId)

            .orderBy('post.createdAt', 'DESC')

            .groupBy('post.id')
            .addGroupBy('user.id')
            .addGroupBy('profile.id')

            .skip(skip)
            .take(limit);

        const { entities, raw } = await queryBuilder.getRawAndEntities();

        const postIds = entities.map(post => post.id);

        const attachments = postIds.length
            ? await this.postAttachmentRepository.find({
                where: {
                    post: {
                        id: In(postIds),
                    },
                },
                relations: {
                    post: true,
                },
            })
            : [];

        const attachmentsWithUrls = await Promise.all(
            attachments.map(
                async attachment => {
                    const url = await this.supabaseStorageService.createDownloadUrl('post-attachments', attachment.storagePath, 60 * 60);

                    return {
                        id: attachment.id,
                        postId: attachment.post.id,
                        type: attachment.type,
                        fileName: attachment.fileName,
                        mimeType: attachment.mimeType,
                        fileSize: attachment.fileSize,
                        url,
                    };

                }
            )
        );

        const attachmentsByPost =
            new Map<
                string,
                typeof attachmentsWithUrls
            >();

        for (
            const attachment
            of attachmentsWithUrls
        ) {

            const existing =
                attachmentsByPost.get(
                    attachment.postId,
                ) ?? [];

            existing.push(attachment);

            attachmentsByPost.set(
                attachment.postId,
                existing,
            );
        }

        const transformedPosts = entities.map((post, index) => {

            const postAttachments=attachmentsByPost.get(post.id) ?? [];

            return{
            id: post.id,
            title: post.title,
            content: post.content,
            type: post.type,
            createdAt: post.createdAt,

            author: {
                id: post.user.id,
                name: `${post.user.profile.firstName} ${post.user.profile.lastName}`
            },

            helpfulCount: Number(raw[index].helpfulCount),

            isHelpful: raw[index].isHelpful === true || raw[index].isHelpful === 'true',

            attachments: postAttachments.map(
                attachment=>({
                    id:attachment.id,
                    type:attachment.type,
                    fileName:attachment.fileName,
                    mimeType:attachment.mimeType,
                    fileSize:attachment.fileSize,
                    url:attachment.url
                })
            )
        }
        });

        const total = await this.postRepository.count({
            where: {
                isDeleted: false
            }
        });

        return {
            data: {
                posts: transformedPosts
            },
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        }

    }

    async findPostById(postId: string) {

        const post = await this.postRepository.findOne({
            where: {
                id: postId,
                isDeleted: false
            }
        });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        return post;

    }

    private async normalizeHashTags(manager: EntityManager, hashtags?: string[]): Promise<HashTagEntity[]> {

        if (!hashtags?.length) {
            return [];
        }

        const names = [...new Set(hashtags.map(h => h.trim().toLowerCase()).filter(Boolean))];

        const existing = await manager.find(HashTagEntity, {
            where: {
                name: In(names)
            }
        });

        const existingNames = new Set(existing.map(h => h.name));

        const newNames = names.filter(name => !existingNames.has(name));

        let created: HashTagEntity[] = [];

        if (newNames.length > 0) {
            const newEntities = newNames.map(name => manager.create(HashTagEntity, {
                name
            }));

            created = await manager.save(newEntities);
        }

        return [...existing, ...created];

    }
}

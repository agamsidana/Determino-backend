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
import { PostAttachmentType } from './enums/post-attachment-type.enum';
import { PollInputDto } from './dto/poll-input.dto';
import { PostPollEntity } from './entities/post-poll.entity';
import { PostPollOptionEntity } from './entities/post-poll-option.entity';
import { PostType } from './enums/post-type.enum';
import { POST_MESSAGES } from 'src/shared/constants/messages/post.messages';
import { UserEntity } from '../user/entities/user.entity';
import { ProfileEntity } from '../profile/entities/profile.entity';
import { PostPollVoteEntity } from './entities/post-poll-vote.entity';
import { PollResult } from './interfaces/poll-result.interface';
@Injectable()
export class PostService {

    constructor(@InjectRepository(PostEntity) private readonly postRepository: Repository<PostEntity>, @InjectRepository(PostReactionEntity) private readonly postReactionRepository: Repository<PostReactionEntity>, @InjectRepository(HashTagEntity) private readonly hashtagRepository: Repository<HashTagEntity>, @InjectRepository(PostAttachmentEntity) private readonly postAttachmentRepository: Repository<PostAttachmentEntity>, @InjectRepository(ProfileEntity) private profileRepository: Repository<ProfileEntity>, @InjectRepository(PostPollOptionEntity) private readonly postPollOptionRepository:Repository<PostPollOptionEntity>, @InjectRepository(PostPollVoteEntity) private readonly postPollVoteRepository:Repository<PostPollVoteEntity>, private supabaseStorageService: SupabaseStorageService, private readonly dataSource: DataSource) { }

    async createPost(user: UserEntity, dto: CreatePostDto) {

        const profile = await this.profileRepository.findOne({
            where: {
                user: {
                    id: user.id
                },
            },
            relations: {
                exam: true
            }
        })

        const { content,title, type, hashtags, attachments, poll } = dto;

        return this.dataSource.transaction(async (manager) => {

            const normalizeHashtags = await this.normalizeHashTags(manager, hashtags);

            const linkAttachments = (attachments ?? []).filter((attachment) => attachment.type === PostAttachmentType.LINK);
            const fileAttachments = (attachments ?? []).filter((attachment) => attachment.type !== PostAttachmentType.LINK);

            const uploadIds = fileAttachments?.map(attachment => attachment.uploadId) ?? [];

            const uploads = uploadIds.length ? await manager.find(PostUploadEntity, {
                where: {
                    id: In(uploadIds),
                    userId: user.id,
                    isUsed: false
                }
            }) : [];

            if (uploads.length !== uploadIds.length) {
                throw new NotFoundException(
                    POST_MESSAGES.ONE_OR_MORE_ATTACHMENTS_ARE_INVALID,
                );
            }

            const post = manager.create(PostEntity, {
                content,
                title,
                type,
                hashtags: normalizeHashtags,
                user: {
                    id: user.id
                }
            });

            const savedPost = await manager.save(post);

            const postFileAttachments = uploads.map(upload =>
                manager.create(PostAttachmentEntity, {
                    type: upload.type,
                    storagePath: upload.storagePath,
                    fileName: upload.fileName,
                    mimeType: upload.mimeType,
                    fileSize: upload.fileSize,
                    post: savedPost
                })
            );

            const postLinkAttachments = linkAttachments.map((attachment) =>
                manager.create(PostAttachmentEntity, {
                    type: attachment.type,
                    url: attachment.url,
                    post: savedPost
                })
            )

            const postAttachments = [
                ...postFileAttachments,
                ...postLinkAttachments,
            ];


            const savedPostAttachments = postAttachments.length
                ? await manager.save(postAttachments)
                : [];

            uploads.forEach(upload => upload.isUsed = true);

            if (uploads.length) {
                await manager.save(uploads);
            }

            const attachmentsWithUrls = await Promise.all(
                savedPostAttachments.map(async (attachment) => {

                    const url = attachment.type === PostAttachmentType.LINK
                        ? attachment.url
                        : await this.supabaseStorageService.createDownloadUrl(
                            'post-attachments',
                            attachment.storagePath,
                            60 * 60,
                        );

                    return {
                        id: attachment.id,
                        type: attachment.type,
                        fileName: attachment.fileName,
                        mimeType: attachment.mimeType,
                        fileSize: attachment.fileSize,
                        url,
                    };
                }),
            );

            let savedPoll: PollResult | null = null;


            if (poll && type !== PostType.QUESTION) {
                savedPoll = await this.createPoll(manager, savedPost.id, poll);
            }

            return {
                data: {
                    id: savedPost.id,
                    title:savedPost.title,
                    content: savedPost.content,
                    type: savedPost.type,
                    createdAt: savedPost.createdAt,

                    author: {
                        id: user.id,
                        name: `${user.profile.firstName} ${user.profile.lastName}`,
                        exam: profile?.exam?.name ?? null
                    },

                    helpfulCount: 0,
                    isHelpful: false,
                    isSaved: false,
                    replyCount: 0,

                    hashtags: normalizeHashtags.map(hashtag => ({
                        id: hashtag.id,
                        name: hashtag.name
                    })),
                    attachments: attachmentsWithUrls,
                    poll: savedPoll,
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
            .leftJoinAndSelect('profile.exam', 'exam')

            .leftJoin(
                'post.reactions',
                'reaction',
                'reaction.type = :reactionType',
                {
                    reactionType: ReactionType.HELPFUL,
                },
            )
            .leftJoin(
                'post.comments',
                'comment',
                'comment.isDeleted = :isDeleted',
                {
                    isDeleted: false
                }
            )

            .where('post.isDeleted = :isDeleted', {
                isDeleted: false,
            })
            .andWhere('post.type = :type',{
                type:PostType.POST
            })

            .addSelect(
                'COUNT(DISTINCT reaction.id)',
                'helpfulCount',
            )
            .addSelect(
                'COUNT(DISTINCT comment.id)',
                'replyCount'
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

            .addSelect(
                `EXISTS (
                SELECT 1 
                FROM post_saves user_save
                 WHERE user_save."postId" = post.id
                 AND user_save."userId" = :userId
                )`,
                'isSaved'
            )

            .setParameter('userId', userId)

            .orderBy('post.createdAt', 'DESC')

            .groupBy('post.id')
            .addGroupBy('user.id')
            .addGroupBy('profile.id')
            .addGroupBy('exam.id')

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

                    let url: string | null = null;

                    if (attachment.type === PostAttachmentType.LINK) {
                        url = attachment.url
                    }

                    else {

                        url = await this.supabaseStorageService.createDownloadUrl('post-attachments', attachment.storagePath, 60 * 60);

                    }

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

        const postWithHashtags = postIds.length ? await this.postRepository.find({
            where:{
                id:In(postIds),
            },
            relations:{
                hashtags:true
            }
        }) : [];

        const hashtagsByPost = new Map(
            postWithHashtags.map((p)=>[
                p.id,
                p.hashtags.map((h)=> ({id:h.id,name:h.name}))
            ])
        );


        const pollsRaw = postIds.length ? await this.postPollOptionRepository
                        .createQueryBuilder('option')
                        .innerJoin('option.postPoll','poll')
                        .innerJoin('poll.post', 'post')
                        .leftJoin('option.votes', 'vote')
                        .addSelect('COUNT(DISTINCT vote.id)', 'voteCount')
                        .addSelect('poll.id','pollId')
                        .addSelect('post.id','postId')
                        .where('post.id IN (:...postIds)',{postIds})
                        .groupBy('option.id')
                        .addGroupBy('poll.id')
                        .addGroupBy('post.id')
                        .orderBy('option.position', 'ASC')
                        .getRawAndEntities()
                    : {entities:[],raw:[]};
        
        const userVotes = postIds.length
                ? await this.postPollVoteRepository.find({
                    where:{
                        user:{id:userId},
                        poll:{
                            post:{
                                id:In(postIds)
                            }
                        }
                    },
                    relations:{option:true,poll:true}
                })
                : [];
        
        const votedOptionByPoll = new Map(userVotes.map((v)=>[v.poll.id,v.option.id]));

        const pollByPost = new Map<string,PollResult>();

        pollsRaw.entities.forEach((option,idx)=>{
            const raw = pollsRaw.raw[idx];
            const postId = raw.postId;
            const pollId = raw.pollId;

            const existing:PollResult = pollByPost.get(postId) ?? {id:pollId,options:[]};

            existing.options.push({
                id:option.id,
                text:option.text,
                position:option.position,
                voteCount:Number(raw.voteCount),
                isSelected:votedOptionByPoll.get(pollId) === option.id     
            });

            pollByPost.set(postId,existing);

        })


        const transformedPosts = entities.map((post, index) => {

            const postAttachments = attachmentsByPost.get(post.id) ?? [];

            return {
                id: post.id,
                title:post.title,
                content: post.content,
                type: post.type,
                createdAt: post.createdAt,

                author: {
                    id: post.user.id,
                    name: `${post.user.profile.firstName} ${post.user.profile.lastName}`,
                    exam: post.user.profile.exam?.name ?? null,
                    avatar: post.user.profile?.avatar ?? null
                },

                helpfulCount: Number(raw[index].helpfulCount),
                replyCount: Number(raw[index].replyCount),

                isSaved: raw[index].isSaved === true || raw[index].isSaved === 'true',
                isHelpful: raw[index].isHelpful === true || raw[index].isHelpful === 'true',

                hashtags:hashtagsByPost.get(post.id) ?? [],
                poll: pollByPost.get(post.id) ?? null,

                attachments: postAttachments.map(
                    attachment => ({
                        id: attachment.id,
                        type: attachment.type,
                        fileName: attachment.fileName,
                        mimeType: attachment.mimeType,
                        fileSize: attachment.fileSize,
                        url: attachment.url
                    })
                )
            }
        });

        const total = await this.postRepository.count({
            where: {
                isDeleted: false,
                type:PostType.POST
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
            throw new NotFoundException(POST_MESSAGES.POST_NOT_FOUND);
        }

        return post;

    }

    async suggestHashtags(q: string | undefined, limit: number) {

        const search = q?.trim().toLowerCase();

        // 1. If no seach query than return empty array
        if (!search) {
            return {
                data: {
                    hashtags: []
                }
            }
        }

        // 2. Otherwise return more likely matched
        const result = await this.hashtagRepository
            .createQueryBuilder('h')
            .select(['h.id', 'h.name'])
            .where('h.name ILIKE :q', {
                q: `${search}%`
            })
            .orderBy('h.name', 'ASC')
            .limit(limit)
            .getMany()

        return { data: { hashtags: result.map((h) => ({ id: h.id, name: h.name })) } };

    }

    async getTrendingHashtags(limit = 8,days = 15){

        const since = new Date(Date.now() - days*24*60*60*1000);

        const rows = await this.hashtagRepository
            .createQueryBuilder('h')
            .innerJoin(
                'h.posts',
                'post',
                'post.isDeleted = :isDeleted AND post.createdAt >= :since',
                { isDeleted: false, since },
            )
            .select('h.id', 'id')
            .addSelect('h.name', 'name')
            .addSelect('COUNT(DISTINCT post.id)', 'postCount')
            .groupBy('h.id')
            .orderBy('"postCount"', 'DESC')
            .addOrderBy('h.name', 'ASC')
            .limit(limit)
            .getRawMany<{ id: string; name: string; postCount: string }>();
        
            
        return {
            data: {
                topics: rows.map((r) => ({
                    id: r.id,
                    name: r.name,
                    postCount: Number(r.postCount),
                })),
            },
        };

    }


    async normalizeHashTags(manager: EntityManager, hashtags?: string[]): Promise<HashTagEntity[]> {

        if (!hashtags?.length) {
            return [];
        }

        const names = [...new Set(hashtags.map(h => h.trim().replace(/^#/, '').toLowerCase()).filter(Boolean))];

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

    async getTotalPosts(userId: string): Promise<number> {
        return this.postRepository.count({
            where: {
                user: { id: userId },
                type: PostType.POST,
                isDeleted: false,
            },
        });
    }

    async getTotalDoubts(userId: string): Promise<number> {
        return this.postRepository.count({
            where: {
                user: { id: userId },
                type: PostType.QUESTION,
                isDeleted: false,
            },
        });
}

    private async createPoll(manager: EntityManager, postId: string, dto: PollInputDto) {

        const { options } = dto;

        const poll = manager.create(PostPollEntity, {
            post: {
                id: postId
            }
        });

        const savedPoll = await manager.save(poll);

        const optionEntities = options.map((option, idx) =>
            manager.create(PostPollOptionEntity, {
                text: option,
                position: idx,
                postPoll: { id: savedPoll.id }
            })
        );

        const savedOptions = await manager.save(PostPollOptionEntity, optionEntities);

        return {
            id: savedPoll.id,
            options: savedOptions.map((option) => ({
                id: option.id,
                text: option.text,
                position: option.position,
                voteCount: 0,
                isSelected: false
            })),
        };

    }
}

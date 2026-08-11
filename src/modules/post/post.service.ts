import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { PaginationQueryDto } from 'src/shared/dto/pagination-query.dto';
import { ReactionType } from './enums/reaction-type.enum';
import { PostReactionEntity } from './entities/post-reaction.entity';

@Injectable()
export class PostService {

    constructor(@InjectRepository(PostEntity) private readonly postRepository: Repository<PostEntity>, @InjectRepository(PostReactionEntity) private readonly postReactionRepository: Repository<PostReactionEntity>) { }

    async createPost(userId: string, dto: CreatePostDto) {

        const { title, content, type } = dto;

        const post = this.postRepository.create({
            title,
            content,
            type,
            user: {
                id: userId
            }
        });

        const savedPost = await this.postRepository.save(post);

        return {
            data: {
                id: savedPost.id,
                title: savedPost.title,
                type: savedPost.type,
                content: savedPost.content,
                createdAt: savedPost.createdAt
            }
        }

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

        const total = await this.postRepository.count({
            where: {
                isDeleted: false
            }
        });

        const transformedPosts = entities.map((post, index) => ({
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

            isHelpful: raw[index].isHelpful === true || raw[index].isHelpful === 'true'
        }));

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

}

import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { PostCommentEntity } from "./entities/post-comment.entity";
import { Repository } from "typeorm";
import { PostEntity } from "./entities/post.entity";
import { PaginationQueryDto } from "src/shared/dto/pagination-query.dto";
import { UserEntity } from "../user/entities/user.entity";
import { POST_MESSAGES } from "src/shared/constants/messages/post.messages";
import { PostCommentLikeEntity } from "./entities/post-comment-like.entity";


@Injectable()
export class PostCommentService {

    constructor(@InjectRepository(PostCommentEntity) private readonly postCommentRepository: Repository<PostCommentEntity>, @InjectRepository(PostCommentLikeEntity) private readonly postCommentLikeRepository: Repository<PostCommentLikeEntity>, @InjectRepository(PostEntity) private readonly PostRepository: Repository<PostEntity>) { }

    async createComment(postId: string, user: UserEntity, dto: CreateCommentDto) {

        const { content } = dto;

        const post = await this.PostRepository.findOne({
            where: {
                id: postId,
                isDeleted: false
            }
        });

        if (!post) {
            throw new NotFoundException(POST_MESSAGES.POST_NOT_FOUND)
        }

        const comment = this.postCommentRepository.create({
            content: content,
            post: { id: post.id },
            user: { id: user.id }
        });

        const savedComment = await this.postCommentRepository.save(comment);

        return {
            data: {
                id: savedComment.id,
                content: savedComment.content,
                createdAt: savedComment.createdAt,
                author: {
                    id: user.id,
                    name: `${user.profile.firstName} ${user.profile.lastName}`
                },
                likeCount:0,
                isLikes:false
            }
        }

    }

    async getComments(postId: string,userId:string, query: PaginationQueryDto) {

        const { page, limit } = query;

        const skip = (page - 1) * limit;

        const queryBuilder = this.postCommentRepository
                         .createQueryBuilder('comment')

                         .leftJoinAndSelect('comment.user','user')
                         .leftJoinAndSelect('user.profile','profile')

                         .leftJoin('comment.likes','like')

                         .where('comment.post.id = :postId',{postId})
                         .andWhere('comment.isDeleted = :isDeleted',{isDeleted:false})

                         .addSelect('COUNT(DISTINCT like.id)','likeCount')
                         
                         .addSelect(
                            `EXISTS (

                            SELECT 1 FROM post_comment_likes user_like
                            WHERE user_like."commentId" = comment.id
                            AND user_like."userId" = :userId 

                            )`,

                            'isLiked'
                         )

                         .setParameter('userId',userId)

                         .orderBy('comment.createdAt', 'DESC')

                         .groupBy('comment.id')
                         .addGroupBy('user.id')
                         .addGroupBy('profile.id')

                         .skip(skip)
                         .take(limit);
            
            const {entities,raw} = await queryBuilder.getRawAndEntities();

            const total = await this.postCommentRepository.count({
                where:{
                    post:{
                        id:postId
                    },
                    isDeleted:false
                }
            })



        const transformedResponse = entities.map((comment,idx) => ({
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt,
            author: {
                id: comment.user.id,
                name: `${comment.user.profile.firstName} ${comment.user.profile.lastName}`
            },
            likeCount:Number(raw[idx].likeCount),
            isLiked:raw[idx].isLiked === true || raw[idx].isLiked === 'true',
        }));

        return {
            data: {
                comments: transformedResponse
            },
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        }

    }

    async likeComment(commentId: string, userId: string) {
        const comment = await this.postCommentRepository.findOne({
            where: {
                id: commentId,
                isDeleted: false
            }
        });

        if (!comment) {
            throw new NotFoundException(POST_MESSAGES.COMMENT_NOT_FOUND)
        }

        const like = this.postCommentLikeRepository.create({
            user: {
                id: userId
            },
            comment: {
                id: commentId
            }
        });

        try {
            await this.postCommentLikeRepository.save(like);
        }

        catch (err: any) {

            if (err.code === '23505') {
                throw new ConflictException(POST_MESSAGES.COMMENT_ALREADY_LIKED);
            }

            throw err;

        }

        return {
            message: POST_MESSAGES.POST_COMMENT_LIKE_ADDED
        }

    }

    async unlikeComment(commentId: string, userId: string) {

        const result = await this.postCommentLikeRepository.delete({
            user: {
                id: userId
            },
            comment: {
                id: commentId
            }
        });

        if (result.affected === 0) {
            throw new NotFoundException(POST_MESSAGES.LIKE_NOT_FOUND)
        }

        return {
            message: POST_MESSAGES.POST_COMMENT_LIKE_REMOVED
        }

    }

}
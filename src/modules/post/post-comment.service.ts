import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { PostCommentEntity } from "./entities/post-comment.entity";
import { Repository } from "typeorm";
import { PostEntity } from "./entities/post.entity";
import { PaginationQueryDto } from "src/shared/dto/pagination-query.dto";
import { UserEntity } from "../user/entities/user.entity";
import { POST_MESSAGES } from "src/shared/constants/messages/post.messages";


@Injectable()
export class PostCommentService {

    constructor(@InjectRepository(PostCommentEntity) private readonly postCommentRepository: Repository<PostCommentEntity>, @InjectRepository(PostEntity) private readonly PostRepository: Repository<PostEntity>) { }

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
                author:{
                    id:user.id,
                    name:`${user.profile.firstName} ${user.profile.lastName}`
                }
            }
        }

    }

    async getComments(postId: string, query: PaginationQueryDto) {

        const { page, limit } = query;

        const skip = (page - 1) * limit;

        const [comments, total] = await this.postCommentRepository.findAndCount({
            where: {
                post:{id:postId},
                isDeleted: false
            },
            relations: {
                user: {
                    profile: true
                }
            },
            order:{createdAt:'DESC'},
            skip,
            take: limit
        });

        const transformedResponse = comments.map((comment) => ({
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt,
            author: {
                id: comment.user.id,
                name: `${comment.user.profile.firstName} ${comment.user.profile.lastName}`
            }
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

}
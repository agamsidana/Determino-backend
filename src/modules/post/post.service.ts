import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { PaginationQueryDto } from 'src/shared/dto/pagination-query.dto';

@Injectable()
export class PostService {

    constructor(@InjectRepository(PostEntity) private readonly postRepository: Repository<PostEntity>) { }

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

    async getPosts(query: PaginationQueryDto) {

        const { page, limit } = query;
        const skip = (page - 1) * limit;

        const [posts, total] = await this.postRepository.findAndCount({
            where: {
                isDeleted: false
            },
            order: {
                createdAt: 'DESC'
            },
            relations: {
                user: {
                    profile: true
                }
            },
            select: {
                id: true,
                title: true,
                content: true,
                type: true,
                createdAt: true,

                user: {
                    id: true,
                    profile: {
                        firstName: true,
                        lastName: true
                    }
                }
            },
            skip,
            take: limit
        });

        const transformedPosts = posts.map((post) => ({
            id: post.id,
            title: post.title,
            content: post.content,
            type: post.type,
            createdAt: post.createdAt,

            author: {
                id: post.user.id,
                name: [
                    post.user.profile.firstName,
                    post.user.profile.lastName,
                ]
                    .filter(Boolean)
                    .join(' ')
            }
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

}

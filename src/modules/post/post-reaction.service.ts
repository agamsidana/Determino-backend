import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PostReactionEntity } from "./entities/post-reaction.entity";
import { QueryFailedError, Repository } from "typeorm";
import { ReactionType } from "./enums/reaction-type.enum";
import { PostService } from "./post.service";


@Injectable()
export class PostReactionService {

    constructor(@InjectRepository(PostReactionEntity) private readonly postReactionRepository: Repository<PostReactionEntity>, private readonly postService: PostService) { }

    async addHelpful(postId: string, userId: string) {

        await this.postService.findPostById(postId);

        try {

            const postReaction = this.postReactionRepository.create({
                type: ReactionType.HELPFUL,
                user: {
                    id: userId
                },
                post: {
                    id: postId
                }
            });

            await this.postReactionRepository.save(postReaction);
        }

        catch (error) {

            if (error instanceof QueryFailedError && (error as any).driverError?.code === "23505") {
                const constraint = (error as any).driverError?.constraint;

                if (constraint === "UQ_POST_REACTION_USER_POST_TYPE") {
                    throw new ConflictException('User has already marked this post as helpful')
                }
            }

            throw error;

        }

        return {
            message:'Post helpful reaction added'
        }

    }

    async removeHelpful(postId: string, userId: string) {

        const result = await this.postReactionRepository.delete({
            user: {
                id: userId
            },
            post: {
                id: postId
            },
            type: ReactionType.HELPFUL
        });

        if (result.affected === 0) {
            throw new NotFoundException(
                'Helpful reaction not found',
            );
        }

        return {
            message: 'Post helpful reaction removed',
        };

    }
}
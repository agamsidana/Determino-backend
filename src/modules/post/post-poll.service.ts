import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { VotePollDto } from "./dto/vote-poll.dto";
import { DataSource } from "typeorm";
import { PostEntity } from "./entities/post.entity";
import { PostPollOptionEntity } from "./entities/post-poll-option.entity";
import { PostPollVoteEntity } from "./entities/post-poll-vote.entity";
import { POST_MESSAGES } from "src/shared/constants/messages/post.messages";


@Injectable()
export class PostPollService {

    constructor(private readonly dataSource: DataSource) { }

    async voteOnPoll(postId: string, userId: string, dto: VotePollDto) {

        const { optionId } = dto;

        return this.dataSource.transaction(async (manager) => {


            // 1. Find the post and its poll
            const post = await manager.findOne(PostEntity, {
                where: {
                    id: postId,
                    isDeleted: false
                },
                relations: {
                    poll: true
                }
            });

            if (!post) {
                throw new NotFoundException(POST_MESSAGES.POST_NOT_FOUND);
            }

            // 2. Make sure this post actually has a poll
            if (!post.poll) {
                throw new BadRequestException(POST_MESSAGES.POST_DOES_NOT_CONTAIN_POLL)
            }


            // 3. Find the selected option ,Important:we check both optionId and PollId this prevent user from sending an option belongs to another poll
            const option = await manager.findOne(PostPollOptionEntity, {
                where: {
                    id: optionId,
                    postPoll: {
                        id: post.poll.id
                    }
                }
            });

            if (!option) {
                throw new NotFoundException(
                    POST_MESSAGES.POLL_OPTION_NOT_FOUND,
                );
            }


            // 4.Check whether this user has already voted
            const existingVote = await manager.findOne(PostPollVoteEntity, {
                where: {
                    poll: {
                        id: post.poll.id
                    },
                    user: {
                        id: userId
                    }
                }
            });

            if (existingVote) {
                throw new ConflictException(
                    POST_MESSAGES.ALREADY_VOTED_IN_THIS_POLL,
                );
            }

            // 5.create the vote
            const vote = manager.create(PostPollVoteEntity,{
                poll:post.poll,
                option:option,
                user:{
                    id:userId
                }
            });

            // 6.save the vote
            const savedVote=await manager.save(vote);


            // 7.return response
            return {
                data:{
                    voteId:savedVote.id,
                    pollId:post.poll.id,
                    optionId:option.id
                }
            }

        })

    }

}
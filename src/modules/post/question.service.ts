import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { QuestionAnswerEntity } from "./entities/question-answer.entity";
import { Repository } from "typeorm";
import { PostEntity } from "./entities/post.entity";
import { CreateAnswerDto } from "./dto/create-answer.dto";
import { PostType } from "./enums/post-type.enum";
import { UserEntity } from "../user/entities/user.entity";
import { PaginationQueryDto } from "src/shared/dto/pagination-query.dto";
import { AnswerVoteEntity } from "./entities/answer-vote.entity";
import { DataSource } from "typeorm";

@Injectable()
export class QuestionService {
    constructor(@InjectRepository(QuestionAnswerEntity) private readonly answerRepository: Repository<QuestionAnswerEntity>,@InjectRepository(AnswerVoteEntity) private readonly answerVoteRepository:Repository<AnswerVoteEntity>, @InjectRepository(PostEntity) private readonly postRepository: Repository<PostEntity>,private readonly dataSource:DataSource) { }

    async submitAnswer(questionId: string, user: UserEntity, dto: CreateAnswerDto) {

        const { content } = dto;

        const post = await this.postRepository.findOne({
            where: {
                id: questionId,
                isDeleted: false,
                type: PostType.QUESTION
            }
        });

        if (!post) {
            throw new NotFoundException('question not found');
        }

        const answer = this.answerRepository.create({
            content,
            post: {
                id: post.id
            },
            user: {
                id: user.id
            }
        });

        const savedAnswer = await this.answerRepository.save(answer);

        return {
            data: {
                id: savedAnswer.id,
                content: savedAnswer.content,
                isAccepted: false,
                voteCount: 0,
                isVoted: false,
                createdAt: savedAnswer.createdAt,
                author: {
                    id: user.id,
                    name: `${user.profile.firstName} ${user.profile.lastName}`
                }
            }
        }

    }

    async getAnswers(questionId: string, user: UserEntity, query: PaginationQueryDto) {

        const { page, limit } = query;

        const skip = (page - 1) * limit;

        const queryBuilder = this.answerRepository
                             .createQueryBuilder('answer')
                             .leftJoinAndSelect('answer.user','user')
                             .leftJoinAndSelect('user.profile','profile')

                             .leftJoin('answer.votes','vote')
                             .where('answer.post.id = :questionId',{questionId})
                             .andWhere('answer.isDeleted = :isDeleted',{isDeleted:false})

                             .addSelect('COUNT(DISTINCT vote.id)','voteCount')

                             .addSelect(
                                `
                                EXISTS (

                                SELECT 1 FROM answer_votes user_vote
                                WHERE user_vote."answerId" = answer.id
                                AND user_vote."userId" = :userId

                                )`,
                                'isVoted'
                             )

                             .setParameter('userId',user.id)

                             .orderBy('answer.isAccepted', 'DESC')      // accepted answer first
                             .addOrderBy('voteCount', 'DESC')           // then by vote count
                             .addOrderBy('answer.createdAt', 'DESC')    // tie-breaker

                             .groupBy('answer.id')
                             .addGroupBy('user.id')
                             .addGroupBy('profile.id')

                             .skip(skip)
                             .take(limit)
        
        const {entities,raw} = await queryBuilder.getRawAndEntities();

        const total = await this.answerRepository.count({
            where:{
                id:questionId,
                isDeleted:false
            }
        });

        const transformedResponse = entities.map((answer,idx)=>({
            id:answer.id,
            content:answer.content,
            isAccepted:answer.isAccepted,
            createdAt:answer.createdAt,
            author:{
                id:answer.user.id,
                name:`${answer.user.profile.firstName} ${answer.user.profile.lastName}`
            },
            voteCount: Number(raw[idx].voteCount),
            isVoted: raw[idx].isVoted === true || raw[idx].isVoted === 'true'
        }));

        return {
            data:{
                answers:transformedResponse
            },
            pagination:{
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        }
                             

    }

    async voteAnswer(answerId:string,userId:string){

        const answer = await this.answerRepository.findOne({
            where:{
                id:answerId,
                isDeleted:false
            }
        });

        if(!answer){
            throw new NotFoundException('answer not found');
        }

        const vote = this.answerVoteRepository.create({
            answer:{
                id:answerId
            },
            user:{
                id:userId
            }
        });

        try{
            await this.answerVoteRepository.save(vote);
        }
        catch(err:any){
            if (err.code === '23505') {
                 throw new ConflictException('answer already voted');
            }
           
            throw err;
        }

        return {
            message:'answer vote added'
        }

    }

    async unvoteAnswer(answerId:string,userId:string){

        const result = await this.answerVoteRepository.delete({
            user:{
                id:userId
            },
            answer:{
                id:answerId
            }
        });

        if(result.affected === 0){
            throw new NotFoundException('vote not found')
        }

        return {
            message:'answer vote removed'
        }

    }

    async acceptAnswer(answerId:string,userId:string){

        return this.dataSource.transaction(async (manager)=>{

            const answer = await manager.findOne(QuestionAnswerEntity,{
                where:{
                    id:answerId,
                    isDeleted:false
                },
                relations:{
                    post:{user:true}
                }
            });

            if(!answer){
                throw new NotFoundException('Answer not found');
            }

            if(answer.post.user.id !== userId){
                throw new ForbiddenException('Only the question author can accept an answer');
            }

            await manager.update(QuestionAnswerEntity,
                {post:{id:answer.post.id},isAccepted:true},
                {isAccepted:false}
            );

            answer.isAccepted = true;
            await manager.save(answer);

            return {
                data:{
                    id:answer.id,
                    isAccepted:true
                }
            }

        })
    }

}
import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { QuestionAnswerEntity } from "./entities/question-answer.entity";
import { In, Repository } from "typeorm";
import { PostEntity } from "./entities/post.entity";
import { CreateAnswerDto } from "./dto/create-answer.dto";
import { PostType } from "./enums/post-type.enum";
import { UserEntity } from "../user/entities/user.entity";
import { PaginationQueryDto } from "src/shared/dto/pagination-query.dto";
import { AnswerVoteEntity } from "./entities/answer-vote.entity";
import { DataSource } from "typeorm";
import { CreateQuestionDto } from "./dto/create-question.dto";
import { ProfileEntity } from "../profile/entities/profile.entity";
import { PostService } from "./post.service";
import { ReactionType } from "./enums/reaction-type.enum";
import { ChallengeService } from "../challenge/challenge.service";
import { HabitGoalType } from "../challenge/enums/habit-goal-type.enum";
import { QUESTION_MESSAGES } from "src/shared/constants/messages/question.messages";

@Injectable()
export class QuestionService {
    constructor(@InjectRepository(QuestionAnswerEntity) private readonly answerRepository: Repository<QuestionAnswerEntity>,@InjectRepository(AnswerVoteEntity) private readonly answerVoteRepository:Repository<AnswerVoteEntity>, @InjectRepository(PostEntity) private readonly postRepository: Repository<PostEntity>, @InjectRepository(ProfileEntity) private readonly profileRepository:Repository<ProfileEntity>,private readonly postService:PostService,private readonly challengeService:ChallengeService, private readonly dataSource:DataSource) { }


    async createQuestion(user:UserEntity,dto:CreateQuestionDto){

        const {title,content,hashtags}=dto;

        const profile = await this.profileRepository.findOne({
            where:{
                user:{id:user.id}
            },
            relations:{exam:true}
        });

        return this.dataSource.transaction(async (manager)=>{
            const normalizeHashtags = await this.postService.normalizeHashTags(manager,hashtags);

            const question = manager.create(PostEntity,{
                title,
                content:content ?? null,
                type:PostType.QUESTION,
                hashtags:normalizeHashtags,
                user:{id:user.id}
            });

            const savedQuestion = await manager.save(question);

            return {
                data:{
                    id:savedQuestion.id,
                    title:savedQuestion.title,
                    content:savedQuestion.content,
                    type:savedQuestion.type,
                    createdAt:savedQuestion.createdAt,

                    author:{
                        id:user.id,
                        name:`${user.profile.firstName} ${user.profile.lastName}`,
                        exam:profile?.exam?.name ?? null
                    },

                    upvoteCount:0,
                    isUpvoted:false,
                    isSaved:false,
                    answerCount:0,
                    hasAcceptedAnswer:false,

                    hashtags: normalizeHashtags.map(h=>({id:h.id,name:h.name}))


                }
            }

        });



    }

    async getQuestions(query:PaginationQueryDto,userId:string){

        const { page, limit } = query;
        const skip = (page - 1) * limit;

        const queryBuilder = this.postRepository
                             .createQueryBuilder('post')

                             .leftJoinAndSelect('post.user','user')
                             .leftJoinAndSelect('user.profile','profile')
                             .leftJoinAndSelect('profile.exam','exam')

                             .leftJoin('post.reactions','reaction','reaction.type = :reactionType',{
                                reactionType:ReactionType.HELPFUL
                             })
                             .leftJoin('post.answers','answer','answer.isDeleted = :isDeleted',{
                                isDeleted:false
                             })

                             .where('post.isDeleted = :isDeleted',{isDeleted:false})
                             .andWhere('post.type = :type',{type:PostType.QUESTION})

                             .addSelect('COUNT(DISTINCT reaction.id)','upvoteCount')
                             .addSelect('COUNT(DISTINCT answer.id)','answerCount')

                             .addSelect(
                                `
                                EXISTS (
                                    SELECT 1 FROM post_reactions user_reaction
                                    WHERE user_reaction."postId" = post.id
                                    AND user_reaction."userId" = :userId
                                    AND user_reaction.type = :reactionType 
                                )
                                `,
                                'isUpvoted'
                             )

                              .addSelect(
                                    `EXISTS (
                                        SELECT 1 FROM post_saves user_save
                                        WHERE user_save."postId" = post.id
                                            AND user_save."userId" = :userId
                                    )`,
                                    'isSaved',
                                )

                            .addSelect(
                                `EXISTS (
                                    SELECT 1 FROM question_answers qa
                                    WHERE qa."postId" = post.id
                                        AND qa."isAccepted" = true
                                )`,
                                'hasAcceptedAnswer',
                            )

                            .setParameter('userId',userId)
                            .setParameter('reactionType',ReactionType.HELPFUL)

                            .orderBy('post.createdAt','DESC')

                            .groupBy('post.id')
                            .addGroupBy('user.id')
                            .addGroupBy('profile.id')
                            .addGroupBy('exam.id')

                            .skip(skip)
                            .take(limit)

        const {entities,raw} = await queryBuilder.getRawAndEntities();

        const postIds = entities.map(post =>post.id);

        const postsWithHashtags = postIds.length
                                ? await this.postRepository.find({
                                    where:{
                                        id:In(postIds),
                                    },
                                    relations:{
                                        hashtags:true
                                    }
                                })
                                : [];

        const hashtagsByPost = new Map(
           postsWithHashtags.map((p) => [p.id, p.hashtags.map((h) => ({ id: h.id, name: h.name }))])
        );

        const transformedQuestions = entities.map((post, index) => ({
            id: post.id,
            title: post.title,
            content: post.content,
            type: post.type,
            createdAt: post.createdAt,

            author: {
                id: post.user.id,
                name: `${post.user.profile.firstName} ${post.user.profile.lastName}`,
                exam: post.user.profile.exam?.name ?? null,
            },

            upvoteCount: Number(raw[index].upvoteCount),
            isUpvoted: raw[index].isUpvoted === true || raw[index].isUpvoted === 'true',
            isSaved: raw[index].isSaved === true || raw[index].isSaved === 'true',
            answerCount: Number(raw[index].answerCount),
            hasAcceptedAnswer: raw[index].hasAcceptedAnswer === true || raw[index].hasAcceptedAnswer === 'true',

            hashtags: hashtagsByPost.get(post.id) ?? [],
    }));

    const total = await this.postRepository.count({
        where: { isDeleted: false, type: PostType.QUESTION }
    });

    return {
        data: { 
            questions: transformedQuestions
        },
        pagination: { 
            page, 
            limit, 
            total, 
            totalPages: Math.ceil(total / limit)
        }
    }

    }

    async getQuestionById(questionId:string,userId:string){

        const queryBuilder = this.postRepository
                            .createQueryBuilder('post')

                            .leftJoinAndSelect('post.user','user')
                            .leftJoinAndSelect('user.profile','profile')
                            .leftJoinAndSelect('profile.exam','exam')

                            .leftJoin('post.reactions', 'reaction', 'reaction.type = :reactionType', {
                                reactionType: ReactionType.HELPFUL,
                            })
                            .leftJoin('post.answers', 'answer', 'answer.isDeleted = :isDeleted', {
                                isDeleted: false
                            })

                            .where('post.id = :questionId', { questionId })
                            .andWhere('post.isDeleted = :isDeleted', { isDeleted: false })
                            .andWhere('post.type = :type', { type: PostType.QUESTION })

                            .addSelect('COUNT(DISTINCT reaction.id)', 'upvoteCount')
                            .addSelect('COUNT(DISTINCT answer.id)', 'answerCount')

                            .addSelect(
                                `EXISTS (
                                    SELECT 1 FROM post_reactions user_reaction
                                    WHERE user_reaction."postId" = post.id
                                        AND user_reaction."userId" = :userId
                                        AND user_reaction.type = :reactionType
                                )`,
                                'isUpvoted',
                            )

                            .addSelect(
                                `EXISTS (
                                    SELECT 1 FROM post_saves user_save
                                    WHERE user_save."postId" = post.id
                                        AND user_save."userId" = :userId
                                )`,
                                'isSaved',
                            )

                            .addSelect(
                                `EXISTS (
                                    SELECT 1 FROM question_answers qa
                                    WHERE qa."postId" = post.id
                                        AND qa."isAccepted" = true
                                )`,
                                'hasAcceptedAnswer',
                            )

                            .setParameter('userId', userId)
                            .setParameter('reactionType', ReactionType.HELPFUL)
                            .groupBy('post.id')
                            .addGroupBy('user.id')
                            .addGroupBy('profile.id')
                            .addGroupBy('exam.id');

        const { entities, raw } = await queryBuilder.getRawAndEntities();

        if (!entities.length) {
            throw new NotFoundException('Question not found');
        }

        const post = entities[0];
        const row = raw[0];

        const postWithHashtags = await this.postRepository.findOne({
            where: { id: questionId },
            relations: { hashtags: true }
        });

        return {
            data: {
                id: post.id,
                title: post.title,
                content: post.content,
                type: post.type,
                createdAt: post.createdAt,

                author: {
                    id: post.user.id,
                    name: `${post.user.profile.firstName} ${post.user.profile.lastName}`,
                    exam: post.user.profile.exam?.name ?? null,
                },

                upvoteCount: Number(row.upvoteCount),
                isUpvoted: row.isUpvoted === true || row.isUpvoted === 'true',
                isSaved: row.isSaved === true || row.isSaved === 'true',
                answerCount: Number(row.answerCount),
                hasAcceptedAnswer: row.hasAcceptedAnswer === true || row.hasAcceptedAnswer === 'true',

                hashtags: postWithHashtags?.hashtags.map((h) => ({ id: h.id, name: h.name })) ?? [],
            }
        }
        
    }

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
            throw new NotFoundException(QUESTION_MESSAGES.QUESTION_NOT_FOUND);
        }

        return await this.dataSource.transaction(async (manager) => {

            const answer = manager.create(QuestionAnswerEntity, {
                content,
                post: {
                    id: post.id
                },
                user: {
                    id: user.id
                }
            });

            const savedAnswer = await manager.save(answer);

            await this.challengeService.recordProgress(
                user.id,
                HabitGoalType.ANSWER_QUESTIONS,
                1,
                manager
            );

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

        })

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
            throw new NotFoundException(QUESTION_MESSAGES.ANSWER_NOT_FOUND);
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
                throw new ConflictException(QUESTION_MESSAGES.ANSWER_ALREAY_VOTED);
            }
           
            throw err;
        }

        return {
            message:QUESTION_MESSAGES.ANSWER_VOTE_ADDED
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
            throw new NotFoundException(QUESTION_MESSAGES.VOTE_NOT_FOUND)
        }

        return {
            message:QUESTION_MESSAGES.ANSWER_VOTE_REMOVED
        }

    }

    async acceptAnswer(answerId: string, userId: string) {

        return this.dataSource.transaction(async (manager) => {

            const answer = await manager.findOne(QuestionAnswerEntity, {
                where: {
                    id: answerId,
                    isDeleted: false
                },
                relations: {
                    post: { user: true },
                    user: true
                }
            });

            if (!answer) {
                throw new NotFoundException(QUESTION_MESSAGES.ANSWER_NOT_FOUND);
            }

            if (answer.post.user.id !== userId) {
                throw new ForbiddenException(QUESTION_MESSAGES.AUTHOR_CAN_ACCEPT_AN_ANSWER);
            }

            if (answer.isAccepted) {
                return {
                    data: {
                        id: answer.id,
                        isAccepted: true
                    }
                }
            }

            await manager.update(QuestionAnswerEntity,
                { post: { id: answer.post.id }, isAccepted: true },
                { isAccepted: false }
            );

            answer.isAccepted = true;
            await manager.save(answer);

            await this.challengeService.recordProgress(
                answer.user.id,
                HabitGoalType.ACCEPTED_ANSWERS,
                1,
                manager
            )

            return {
                data: {
                    id: answer.id,
                    isAccepted: true
                }
            }

        })
    }

}
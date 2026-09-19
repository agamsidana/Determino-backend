import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChallengeEntity } from './entities/challenge.entity';
import { DataSource, EntityManager, LessThan, MoreThan, QueryFailedError, Repository } from 'typeorm';
import { ChallengeParticipantEntity } from './entities/challenge-participant.entity';
import { ResetPeriod } from './enums/reset-period.enum';
import { HabitGoalType } from './enums/habit-goal-type.enum';
import { ChallengeType } from './enums/challenge-type.enum';
import { ChallengeProgressEntity } from './entities/challenge-progress.entity';
import { QuizEntity } from './entities/quiz.entity';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { QuizAttemptEntity } from './entities/quiz-attempt.entity';
import { QuizAttemptAnswerEntity } from './entities/quiz-attempt-answer.entity';

@Injectable()
export class ChallengeService {

    constructor(@InjectRepository(ChallengeEntity) private readonly challengeRepository: Repository<ChallengeEntity>, @InjectRepository(ChallengeParticipantEntity) private readonly challengeParticipantRepository: Repository<ChallengeParticipantEntity>,@InjectRepository(ChallengeProgressEntity) private readonly challengeProgressRepository:Repository<ChallengeProgressEntity>,@InjectRepository(QuizEntity) private readonly quizRepository:Repository<QuizEntity>, @InjectRepository(QuizAttemptEntity) private readonly quizAttemptRepository:Repository<QuizAttemptEntity>,@InjectRepository(QuizAttemptAnswerEntity) private readonly quizAttemptAnswerRepository:Repository<QuizAttemptAnswerEntity>,private readonly dataSource:DataSource) { }

    async getChallenges(userId:string) {

        const todayStart = this.getPeriodStart(ResetPeriod.DAILY)
        const weekStart = this.getPeriodStart(ResetPeriod.WEEKLY);

        const queryBuilder = this.challengeRepository
                             .createQueryBuilder('challenge')

                             .where('challenge.isActive = :isActive',{isActive:true})

                             .addSelect(
                                `
                                EXISTS (
                                SELECT 1 FROM challenge_participants cp
                                WHERE cp."challengeId" = challenge.id
                                AND cp."userId" = :userId
                                )`,
                                'isJoined'
                             )

                             .addSelect(
                                `
                                (SELECT prog.progress FROM challenge_progress prog
                                WHERE prog."challengeId" = challenge.id
                                AND prog."userId" = :userId
                                AND prog."periodStart" = CASE
                                  WHEN challenge."resetPeriod" = 'DAILY' THEN CAST(:todayStart AS date)
                                  WHEN challenge."resetPeriod" = 'WEEKLY' THEN CAST(:weekStart AS date)
                                END
                                )`,
                                'currentProgress'
                             )

                             .addSelect(
                                `
                                (SELECT prog."isCompleted" FROM challenge_progress prog
                                WHERE prog."challengeId" = challenge.id
                                AND prog."userId" = :userId
                                AND prog."periodStart" = CASE
                                    WHEN challenge."resetPeriod" = 'DAILY' THEN CAST(:todayStart AS date)
                                    WHEN challenge."resetPeriod" = 'WEEKLY' THEN CAST(:weekStart AS date)
                                    END
                                )`,
                                'isCompleted'
                             )

                            .addSelect(
                                `
                                (
                                    SELECT q.id
                                    FROM quizzes q
                                    WHERE q."challengeId" = challenge.id
                                    AND q."quizDate" = CAST(:todayStart AS date)
                                    AND q."isActive" = true
                                    AND challenge.type = 'QUIZ'
                                    LIMIT 1
                                )
                                `,
                                'todayQuizId'
                            )

                            .addSelect(
                                `
                                EXISTS (
                                    SELECT 1
                                    FROM quiz_attempts qa
                                    INNER JOIN quizzes q
                                        ON q.id = qa."quizId"
                                    WHERE q."challengeId" = challenge.id
                                    AND q."quizDate" = CAST(:todayStart AS date)
                                    AND q."isActive" = true
                                    AND qa."userId" = :userId
                                    AND challenge.type = 'QUIZ'
                                )
                                `,
                                'isQuizAttempted'
                            )

                             .setParameter('userId',userId)
                             .setParameter('todayStart',todayStart)
                             .setParameter('weekStart',weekStart)

                             .orderBy('challenge.createdAt','ASC');
        
        const { entities, raw } = await queryBuilder.getRawAndEntities();

        const transformedResponse = entities.map((c, index) => {
          
            const todayQuizId = raw[index].todayQuizId ?? null;

            const isQuizAttempted = raw[index].isQuizAttempted === true || raw[index].isQuizAttempted === 'true';
            
            return {
                id: c.id,
                title: c.title,
                description: c.description,
                type: c.type,
                goalType: c.goalType ?? null,
                targetValue: c.targetValue ?? null,
                resetPeriod: c.resetPeriod ?? null,
                isJoined: raw[index].isJoined === true || raw[index].isJoined === 'true',
                currentProgress: raw[index].currentProgress !== null ? Number(raw[index].currentProgress) : 0,
                isCompleted: raw[index].isCompleted === true || raw[index].isCompleted === 'true',
                todayQuiz: c.type === ChallengeType.QUIZ && todayQuizId
                ? {
                    id: todayQuizId,
                    isAttempted: isQuizAttempted,
                }
                : null,
            }
        });

        return {
            data: {
                challenges: transformedResponse
            }
        }

    }

    async joinChallenge(challengeId: string, userId: string) {

        const challenge = await this.challengeRepository.findOne({
            where: {
                id: challengeId,
                isActive: true
            }
        });

        if (!challenge) {
            throw new NotFoundException('challenge not found')
        }

        try {
            const participant = this.challengeParticipantRepository.create({
                challenge: {
                    id: challenge.id
                },
                user: {
                    id: userId
                }
            });

            const savedParticipant = await this.challengeParticipantRepository.save(participant);

            return {
                data: {
                    id: savedParticipant.id,
                    challengeId: challenge.id,
                    joinedAt: savedParticipant.joinedAt
                }
            }
        }
        catch (err: any) {
            if (
                err instanceof QueryFailedError &&
                err.driverError?.code === '23505'
            ) {
                throw new ConflictException(
                    'You have already joined this challenge',
                );
            }

            throw err;
        }

    }

    async getTodayQuiz(challengeId:string,userId:string){

        const challenge = await this.challengeRepository.findOne({
            where:{
                id:challengeId,
                isActive:true
            }
        });

        if(!challenge){
            throw new NotFoundException('challenge not found');
        }

        if (challenge.type !== ChallengeType.QUIZ) {
             throw new BadRequestException('This challenge is not a quiz');
        }

        const today = this.getPeriodStart(ResetPeriod.DAILY);

        const queryBuilder = this.quizRepository
                             .createQueryBuilder('quiz')

                             .leftJoin('quiz.challenge','challenge')
                             .leftJoinAndSelect('quiz.questions', 'questions')

                             .addSelect(`
                                EXISTS (
                                SELECT 1 FROM quiz_attempts attempt
                                WHERE attempt."quizId" = quiz.id
                                AND attempt."userId" = :userId
                                )`,
                                'isAttempted'
                            )

                             .where('challenge.id = :challengeId',{challengeId})
                             .andWhere('quiz.isActive = :isActive',{isActive:true})
                             .andWhere('quiz.quizDate = :today',{today})

                             .setParameter('userId',userId)
                             
        const {entities,raw} = await queryBuilder.getRawAndEntities();

        const quiz = entities[0];

        if(!quiz){
            throw new NotFoundException('Today\'s quiz not found');
        }

        const isAttempted = raw[0]?.isAttempted === true || raw[0]?.isAttempted === 'true';

        const questions = quiz.questions.map((question) => ({
            id: question.id,
            question: question.question,
            options:[question.optionA,question.optionB,question.optionC,question.optionD]
        }));

        return {
            data:{
                id:quiz.id,
                title:quiz.title,
                quizDate:quiz.quizDate,
                isAttempted,
                questions
            }
        }

    }

    async getQuizResult(quizId:string,userId:string){

        const attempt = await this.quizAttemptRepository.findOne({
            where:{
                quiz:{
                    id:quizId
                },
                user:{
                    id:userId
                }
            },
            relations:{
                attemptAnswers:{
                    question:true
                }
            }
        });

        if(!attempt){
            throw new NotFoundException('Quiz attempt not found');
        }

        const percentage = Number((attempt.score / attempt.totalQuestions) * 100).toFixed(2);

        const answers = attempt.attemptAnswers.map((ans)=>({
            questionId:ans.question.id,
            question:ans.question.question,

            options:[
                ans.question.optionA,
                ans.question.optionB,
                ans.question.optionC,
                ans.question.optionD
            ],

            selectedOption:ans.selectedOption,
            correctOption:ans.question.correctOption,
            isCorrect:ans.isCorrect
        }));

        return {
            data:{
                attemptId:attempt.id,
                quizId,
                score:attempt.score,
                totalQuestions:attempt.totalQuestions,
                percentage,
                submittedAt:attempt.submittedAt,
                answers,
            }
        }


    }

    async submitQuiz(quizId: string, userId: string, dto: SubmitQuizDto) {

        const { answers } = dto

        const quiz = await this.quizRepository.findOne({
            where: {
                id: quizId,
                isActive: true
            },
            relations: {
                questions: true
            }
        });

        if (!quiz) {
            throw new NotFoundException('Quiz not found');
        }

        const questionMap = new Map(
            quiz.questions.map(question => [question.id, question])
        );

        let score = 0;

        const validOptions = ['A', 'B', 'C', 'D'];

        const quizAttemptAnswers = answers.map((ans) => {

            const question = questionMap.get(ans.questionId);
            if (!question) {
                throw new BadRequestException('Invalid Question Submitted')
            }

            if (!validOptions.includes(ans.selectedOption)) {
                throw new BadRequestException('Invalid option submitted');
            }

            const isCorrect = ans.selectedOption === question.correctOption;

            if (isCorrect) {
                score++;
            }

            return this.quizAttemptAnswerRepository.create({
                selectedOption: ans.selectedOption,
                isCorrect,
                question: {
                    id: question.id
                }
            });

        });


        const quizAttempt = this.quizAttemptRepository.create({
            totalQuestions: quiz.questions.length,
            score,
            user: {
                id: userId
            },
            quiz: {
                id: quiz.id
            }
        });

        try {
            return await this.dataSource.transaction(async (manager) => {

                const savedAttempt = await manager.save(quizAttempt);

                quizAttemptAnswers.forEach((answer) => {
                    answer.attempt = savedAttempt;
                });

                await manager.save(
                    quizAttemptAnswers,
                );

                return {
                    data: {
                        attemptId: savedAttempt.id,
                        quizId: quiz.id,
                        score: savedAttempt.score,
                        totalQuestions: savedAttempt.totalQuestions,
                        submittedAt: savedAttempt.submittedAt,
                    },
                };

            });
        }
        catch (err: any) {

            if (
                err instanceof QueryFailedError &&
                err.driverError?.code === '23505'
            ) {
                throw new BadRequestException(
                    'You have already submitted this quiz',
                );
            }

            throw err;

        }
    }

    async recordProgress(userId:string,goalType:HabitGoalType,amount:number,manager:EntityManager){

        const challengeRepository = manager.getRepository(ChallengeEntity);
        const challengeParticipantRepository = manager.getRepository(ChallengeParticipantEntity);
        const challengeProgressRepository = manager.getRepository(ChallengeProgressEntity);

        const activeChallenges = await challengeRepository.find({
            where:{
                type:ChallengeType.HABIT,
                goalType,
                isActive:true
            }
        });

        for(const challenge of activeChallenges){

            const participant = await challengeParticipantRepository.findOne({
                where:{
                    challenge:{
                        id:challenge.id
                    },
                    user:{
                        id:userId
                    }
                }
            });

            if(!participant) continue;

            const periodStart = this.getPeriodStart(challenge.resetPeriod);

            let progress = await challengeProgressRepository.findOne({
                where:{
                    challenge:{
                        id:challenge.id
                    },
                    user:{
                        id:userId
                    },
                    periodStart
                }
            });

            if(!progress){
                progress = challengeProgressRepository.create({
                    challenge:{
                        id:challenge.id
                    },
                    user:{
                        id:userId
                    },
                    periodStart,
                    progress:0
                });
            }

            progress.progress += amount;

            if(challenge.targetValue && progress.progress >= challenge.targetValue){
                progress.isCompleted = true;
            }

            await challengeProgressRepository.save(progress);

        }

    }

    private getPeriodStart(resetPeriod:ResetPeriod){

        const now = new Date()

        if(resetPeriod == ResetPeriod.DAILY){
            return now.toISOString().slice(0,10);   // yyyy - MM - DD
        }

        //WEEKLY - normalize to this week's monday
        const day = now.getDay();           // 0 = sunday , 1  = monday .....
        const difftoMonday = day === 0 ? -6 : 1-day;
        const monday = new Date(now);
        monday.setDate(now.getDate() + difftoMonday);

        return monday.toISOString().slice(0,10);
    }

    async getLeaderboard(challengeId: string, userId: string) {

        const today = this.getPeriodStart(ResetPeriod.DAILY);

        const quiz = await this.quizRepository.findOne({
            where: {
                isActive: true,
                quizDate: today,
                challenge: {
                    id: challengeId
                }
            }
        });

        if (!quiz) {
            throw new NotFoundException("Today's quiz not found");
        }

        const attempts = await this.quizAttemptRepository.find({
            where: {
                quiz: {
                    id: quiz.id
                }
            },
            relations: {
                user: {
                    profile: true
                }
            },
            order: {
                score: 'DESC',
                submittedAt: 'ASC'
            },

            take: 7
        });

        const leaderboard = attempts.map((attempt, idx) => ({
            rank: idx + 1,
            userId: attempt.user.id,
            name: `${attempt.user.profile.firstName} ${attempt.user.profile.lastName}`,
            score: attempt.score,
            totalQuestions: attempt.totalQuestions,
            submittedAt: attempt.submittedAt
        }));

        const myAttempt = await this.quizAttemptRepository.findOne({
            where: {
                quiz: {
                    id: quiz.id,
                },
                user: {
                    id: userId,
                },
            },
            relations: {
                user: {
                    profile: true,
                },
            },
        });

        if (!myAttempt) {
            return {
                data: {
                    leaderboard,
                    myEntry: null,
                },
            };
        }

        const betterAttempts = await this.quizAttemptRepository.count({
            where: [
                {
                    quiz: {
                        id: quiz.id,
                    },
                    score: MoreThan(myAttempt.score),
                },
                {
                    quiz: {
                        id: quiz.id,
                    },
                    score: myAttempt.score,
                    submittedAt: LessThan(myAttempt.submittedAt),
                },
            ],
        });

        const myRank = betterAttempts + 1;

        const myEntry = {
                rank: myRank,
                userId: myAttempt.user.id,
                name: `${myAttempt.user.profile.firstName} ${myAttempt.user.profile.lastName}`,
                score: myAttempt.score,
                totalQuestions: myAttempt.totalQuestions,
                submittedAt: myAttempt.submittedAt,
            };

        return {
            data: {
                leaderboard,
                myEntry,
            },
        };





    }


}

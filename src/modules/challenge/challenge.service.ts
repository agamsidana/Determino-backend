import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChallengeEntity } from './entities/challenge.entity';
import { EntityManager, QueryFailedError, Repository } from 'typeorm';
import { ChallengeParticipantEntity } from './entities/challenge-participant.entity';
import { ResetPeriod } from './enums/reset-period.enum';
import { HabitGoalType } from './enums/habit-goal-type.enum';
import { ChallengeType } from './enums/challenge-type.enum';
import { ChallengeProgressEntity } from './entities/challenge-progress.entity';

@Injectable()
export class ChallengeService {

    constructor(@InjectRepository(ChallengeEntity) private readonly challengeRepository: Repository<ChallengeEntity>, @InjectRepository(ChallengeParticipantEntity) private readonly challengeParticipantRepository: Repository<ChallengeParticipantEntity>,@InjectRepository(ChallengeProgressEntity) private readonly challengeProgressRepository:Repository<ChallengeProgressEntity>) { }

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

                             .setParameter('userId',userId)
                             .setParameter('todayStart',todayStart)
                             .setParameter('weekStart',weekStart)

                             .orderBy('challenge.createdAt','ASC');
        
        const { entities, raw } = await queryBuilder.getRawAndEntities();

        const transformedResponse = entities.map((c, index) => ({
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
        }));

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


}

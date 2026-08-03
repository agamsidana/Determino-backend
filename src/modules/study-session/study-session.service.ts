import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StudySession } from './enums/study-session-status.enum';
import { Repository } from 'typeorm';
import { StudySessionEntity } from './entities/study-session.entity';
import { StartSessionDto } from './dto/start-session.dto';
import { StudySessionMessages } from 'src/shared/constants/messages/study-session.messages';
import { StudySessionResponseDto, StudySessionStatusResponseDto } from './dto/study-session-response.dto';
import { PaginationQueryDto } from 'src/shared/dto/pagination-query.dto';
import { HistoryResponseDto } from './dto/history-response.dto';

@Injectable()
export class StudySessionService {

    constructor(@InjectRepository(StudySessionEntity) private readonly studySessionRepository: Repository<StudySessionEntity>) { }

    async startSession(dto: StartSessionDto, userId: string): Promise<StudySessionResponseDto> {

        // 1.Extract Planned Session Minutes And Find If User Already Have Any Active Session If Yes Than Throw Error 
        const { plannedDurationMinutes } = dto;

        const activeSession = await this.findActiveSession(userId);

        if (activeSession) {
            throw new BadRequestException(StudySessionMessages.ACTIVE_SESSION_ALREADY_EXISTS);
        }

        // 2.Calculate Current Time And Create A New Study Session For Logged In User
        const now = new Date();

        const session = this.studySessionRepository.create({
            status: StudySession.RUNNING,
            plannedDurationMinutes,
            startedAt: now,
            user: {
                id: userId
            }
        });

        const savedSession = await this.studySessionRepository.save(session);

        return {
            data: {
                id: savedSession.id,
                status: savedSession.status,
                startedAt: savedSession.startedAt,
                pausedAt: savedSession.pausedAt,
                totalPausedSeconds: savedSession.totalPausedSeconds,
                plannedDurationMinutes: savedSession.plannedDurationMinutes
            }
        }

    }

    async getCurrentSession(userId: string): Promise<StudySessionResponseDto> {

        // 1.Find LoggedIn User Current Study Session If Not Present Return Null OtherWise The Current Session Details 
        const currentSession = await this.findActiveSession(userId);

        if (!currentSession) {
            return {
                data: null
            }
        }

        return {
            data: {
                id: currentSession.id,
                status: currentSession.status,
                startedAt: currentSession.startedAt,
                pausedAt: currentSession.pausedAt,
                totalPausedSeconds: currentSession.totalPausedSeconds,
                plannedDurationMinutes: currentSession.plannedDurationMinutes
            }
        }
    }

    async getSessionHistory(userId: string, query: PaginationQueryDto): Promise<HistoryResponseDto> {

        const { page, limit } = query;
        const skip = (page - 1) * limit;

        const [sessions, total] = await Promise.all([
            this.studySessionRepository.find({
                where: {
                    user: {
                        id: userId
                    },
                    status: StudySession.COMPLETED
                },
                order: {
                    startedAt: 'DESC'
                },
                skip,
                take: limit
            }),
            this.studySessionRepository.count({
                where: {
                    user: {
                        id: userId
                    },
                    status: StudySession.COMPLETED
                }
            })
        ]);

        const data = sessions.map((session) => {

            const totalSeconds = Math.floor(
                (session.endedAt.getTime() - session.startedAt.getTime()) / 1000
            );

            const actualFocusedSeconds =
                totalSeconds - session.totalPausedSeconds;

            const actualFocusMinutes = Math.floor(actualFocusedSeconds / 60);

            return {
                id: session.id,
                startedAt: session.startedAt,
                endedAt: session.endedAt,
                plannedDurationMinutes: session.plannedDurationMinutes,
                actualFocusMinutes,
                status: session.status
            }

        });

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        }

    }

    async pauseSession(userId: string): Promise<StudySessionResponseDto> {

        // 1.Find User Running Study Session If Not Found Throw Error.
        const runningSession = await this.findSessionByStatus(userId, StudySession.RUNNING);

        if (!runningSession) {
            throw new NotFoundException(StudySessionMessages.NO_RUNNING_SESSION);
        }

        // 2.Calculate Current Time And Mark Paused At as Now And Mark Status As PAUSED.
        const now = new Date();

        runningSession.pausedAt = now;
        runningSession.status = StudySession.PAUSED;

        const savedSession = await this.studySessionRepository.save(runningSession);

        return {
            data: {
                id: savedSession.id,
                status: savedSession.status,
                startedAt: savedSession.startedAt,
                pausedAt: savedSession.pausedAt,
                totalPausedSeconds: savedSession.totalPausedSeconds,
                plannedDurationMinutes: savedSession.plannedDurationMinutes
            }
        }

    }

    async resumeSession(userId: string): Promise<StudySessionResponseDto> {

        // 1.Find User Paused Study Session If Not Found Throw Error.
        const pausedSession = await this.findSessionByStatus(userId, StudySession.PAUSED);

        if (!pausedSession) {
            throw new NotFoundException(StudySessionMessages.NO_PAUSED_SESSION);
        }

        // 2.Calculate Current Time, paused duration seconds And Add paused Duration Seconds 
        // To totalPausedSeconds also Mark Status As RUNNUNG.
        const now = new Date();

        const pausedDurationSeconds =
            Math.floor(
                (now.getTime() - pausedSession.pausedAt!.getTime()) / 1000
            );

        pausedSession.totalPausedSeconds += pausedDurationSeconds;
        pausedSession.pausedAt = null;
        pausedSession.status = StudySession.RUNNING;

        const savedSession = await this.studySessionRepository.save(pausedSession);

        return {
            data: {
                id: savedSession.id,
                status: savedSession.status,
                startedAt: savedSession.startedAt,
                pausedAt: savedSession.pausedAt,
                totalPausedSeconds: savedSession.totalPausedSeconds,
                plannedDurationMinutes: savedSession.plannedDurationMinutes
            }
        }


    }

    async finishSession(userId: string): Promise<StudySessionStatusResponseDto> {

        // 1.Find User Active Session And If Not Any Throw Error.
        const activeSession = await this.findActiveSession(userId);

        if (!activeSession) {
            throw new BadRequestException(StudySessionMessages.NO_ACTIVE_SESSION);
        }

        // 2.Calculate Current Time 
        const now = new Date();

        // 3.If Active Session Status Is Paused Than Calculate Paused Duration Seconds And Add
        // It To totalPausedSeconds and Mark paused At as null ( as User Press Finish).
        if (activeSession.status === StudySession.PAUSED) {

            const pausedDurationSeconds =
                Math.floor(
                    (now.getTime() - activeSession.pausedAt!.getTime()) / 1000
                );

            activeSession.totalPausedSeconds += pausedDurationSeconds;
            activeSession.pausedAt = null;
        }

        // 4.Calculate The Actual End Time Based On The Planned Duration.
        const actualEndTime = new Date(
            activeSession.startedAt.getTime() +
            activeSession.plannedDurationMinutes * 60 * 1000 +
            activeSession.totalPausedSeconds * 1000,
        );

        // 5.If The User Finishes Early, Use The Current Time OtherWise The actualEndTime.
        // Also Mark Status As COMPLETED
        activeSession.endedAt =
            now < actualEndTime ? now : actualEndTime;

        activeSession.status = StudySession.COMPLETED;

        // 6. Calculate actual focused seconds for this session
        const totalSessionSeconds = Math.floor((activeSession.endedAt.getTime() - activeSession.startedAt.getTime()) / 1000);
        activeSession.actualStudySeconds = totalSessionSeconds - activeSession.totalPausedSeconds;

        const savedSession = await this.studySessionRepository.save(activeSession);

        return {
            data: {
                status: savedSession.status
            }
        };
    }

    private async findSessionByStatus(userId: string, status: StudySession) {

        return await this.studySessionRepository.findOne({
            where: {
                user: {
                    id: userId,
                },
                status
            }
        });

    }

    private async findActiveSession(userId: string) {

        return await this.studySessionRepository.findOne({
            where: [
                {
                    user: {
                        id: userId
                    },
                    status: StudySession.PAUSED
                },
                {
                    user: {
                        id: userId
                    },
                    status: StudySession.RUNNING
                }
            ]
        })

    }


}

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StudySession } from './enums/study-session-status.enum';
import { Repository } from 'typeorm';
import { StudySessionEntity } from './entities/study-session.entity';
import { StartSessionDto } from './dto/start-session.dto';
import { StudySessionMessages } from 'src/shared/constants/messages/study-session.messages';
import { CurrentStudySessionResponseDto, StartStudySessionResponseDto, StudySessionStatusResponseDto } from './dto/study-session-response.dto';

@Injectable()
export class StudySessionService {

    constructor(@InjectRepository(StudySessionEntity) private readonly studySessionRepository: Repository<StudySessionEntity>) { }

    async startSession(dto: StartSessionDto, userId: string): Promise<StartStudySessionResponseDto> {

        const { plannedDurationMinutes } = dto;

        const runningSession = await this.findSessionByStatus(userId, StudySession.RUNNING);

        if (runningSession) {
            throw new BadRequestException(StudySessionMessages.ALREADY_RUNNING);
        }

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
                plannedDurationMinutes: savedSession.plannedDurationMinutes
            }
        }

    }

    async getCurrentSession(userId: string):Promise<CurrentStudySessionResponseDto> {

        const runningSession = await this.findSessionByStatus(userId, StudySession.RUNNING);

        if (!runningSession) {
            return {
                data: null
            }
        }

        return {
            data: {
                id: runningSession.id,
                status: runningSession.status,
                startedAt: runningSession.startedAt,
                pausedAt: runningSession.pausedAt,
                totalPausedSeconds: runningSession.totalPausedSeconds,
                plannedDurationMinutes: runningSession.plannedDurationMinutes
            }
        }
    }

    async pauseSession(userId: string): Promise<StudySessionStatusResponseDto> {

        const runningSession = await this.findSessionByStatus(userId, StudySession.RUNNING);

        if (!runningSession) {
            throw new NotFoundException(StudySessionMessages.NO_RUNNING_SESSION);
        }

        const now = new Date();

        runningSession.pausedAt = now;
        runningSession.status = StudySession.PAUSED;

        const savedSession = await this.studySessionRepository.save(runningSession);

        return {
            data: {
                status: savedSession.status,
            },
        };

    }

    async resumeSession(userId: string): Promise<StudySessionStatusResponseDto> {

        const pausedSession = await this.findSessionByStatus(userId, StudySession.PAUSED);

        if (!pausedSession) {
            throw new NotFoundException(StudySessionMessages.NO_PAUSED_SESSION);
        }

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
                status: savedSession.status
            }
        }


    }

    async finishSession(userId: string): Promise<StudySessionStatusResponseDto> {

        const activeSession = await this.findActiveSession(userId);

        if (!activeSession) {
            throw new BadRequestException(StudySessionMessages.NO_ACTIVE_SESSION);
        }

        const now = new Date();

        if (activeSession.status === StudySession.PAUSED) {

            const pausedDurationSeconds =
                Math.floor(
                    (now.getTime() - activeSession.pausedAt!.getTime()) / 1000
                );

            activeSession.totalPausedSeconds += pausedDurationSeconds;
            activeSession.pausedAt = null;
        }


        activeSession.endedAt = now;
        activeSession.status = StudySession.COMPLETED;

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

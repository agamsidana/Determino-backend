import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StudySessionEntity } from '../study-session/entities/study-session.entity';
import { Between, Repository } from 'typeorm';
import { StudySession } from '../study-session/enums/study-session-status.enum';

@Injectable()
export class AnalyticsService {

    constructor(@InjectRepository(StudySessionEntity) private readonly studySessionRepository: Repository<StudySessionEntity>) { }

    async getDashboard(userId: string, year?: number) {

        const selectedYear = year ?? new Date().getFullYear();

        const [
            YearSessions,
            totalStudyMinutes,
            recentSessions
        ] = await Promise.all([
            this.getYearSessions(userId, selectedYear),
            this.getTotalStudy(userId),
            this.getRecentSessions(userId)
        ]);

        const heatMap = this.getHeatMap(YearSessions);
        const todayStudyMinutes = this.getTodayStudy(YearSessions)

        return {
            data: {
                todayStudyMinutes,
                totalStudyMinutes,
                recentSessions,
                heatMap
            }
        }
    }

    private getTodayStudy(currentYearSessions: StudySessionEntity[]) {

        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const end = new Date();
        end.setHours(23, 59, 59, 999);

        const todaySessions = currentYearSessions.filter(
            session =>
                session.endedAt >= start &&
                session.endedAt <= end
        );

        const totalSeconds = todaySessions.reduce(
            (sum, session) => sum + session.actualStudySeconds,
            0
        );

        const todayStudyMinutes = Math.floor(totalSeconds / 60);

        return todayStudyMinutes;

    }

    private async getTotalStudy(userId: string) {

        const result = await this.studySessionRepository.createQueryBuilder('studySession')
            .select(
                "SUM(studySession.actualStudySeconds)",
                "totalSeconds"
            )
            .where('studySession.userId = :userId', {
                userId
            })
            .andWhere('studySession.status = :status', {
                status: StudySession.COMPLETED
            })
            .getRawOne();


        const totalSeconds =
            Number(result.totalSeconds ?? 0);

        const totalStudyMinutes = Math.floor(totalSeconds / 60);

        return totalStudyMinutes;

    }

    private async getRecentSessions(userId: string) {

        const recentSessions = await this.studySessionRepository.find({
            where: {
                user: {
                    id: userId
                },
                status: StudySession.COMPLETED,
            },
            order: {
                endedAt: 'DESC'
            },
            take: 3
        });

        return recentSessions.map(session => ({
            id: session.id,
            startedAt: session.startedAt,
            endedAt: session.endedAt,
            plannedDurationMinutes: session.plannedDurationMinutes,
            totalPausedSeconds:session.totalPausedSeconds,
            actualStudyMinutes: Math.floor(session.actualStudySeconds / 60),
            focusPercentage: Math.min((Math.floor(session.actualStudySeconds / 60) / session.plannedDurationMinutes) * 100, 100)
        }));
    }

    private getHeatMap(currentYearSessions: StudySessionEntity[]) {

        const grouped: Record<string, number> = {};

        for (const session of currentYearSessions) {

            const date = session.endedAt.toLocaleDateString('en-CA');

            grouped[date] = (grouped[date] ?? 0) + session.actualStudySeconds;

        }

        return Object.entries(grouped).map(([date, seconds]) => ({
            date,
            studiedMinutes: Math.floor(seconds / 60)
        }));

    }

    private async getYearSessions(userId: string, selectedYear: number) {

        const year = selectedYear;

        const start = new Date(year, 0, 1);

        const end = new Date(year, 11, 31, 23, 59, 59);

        const currentYearSessions = await this.studySessionRepository.find({
            where: {
                user: {
                    id: userId
                },
                status: StudySession.COMPLETED,
                endedAt: Between(start, end)
            },
            select: {
                endedAt: true,
                actualStudySeconds: true
            },
            order: {
                endedAt: 'ASC'
            }
        });

        return currentYearSessions


    }

}

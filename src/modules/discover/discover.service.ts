import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { In,Repository } from 'typeorm';
import { PrepMateConnectionEntity } from '../connection/entities/prepmate-connection.entity';
import { ConnectionStatus } from '../connection/enums/connection-status.enum';
import { StudySessionEntity } from '../study-session/entities/study-session.entity';
import { StudySession } from '../study-session/enums/study-session-status.enum';
import { DiscoverQueryDto } from './dto/discover-query.dto';

@Injectable()
export class DiscoverService {

    constructor(@InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>, @InjectRepository(PrepMateConnectionEntity) private readonly prepMateConnectionRepository: Repository<PrepMateConnectionEntity>, @InjectRepository(StudySessionEntity) private readonly studySessionRepository: Repository<StudySessionEntity>) { }
    
    async getDiscover(userId: string, query: DiscoverQueryDto) {

        const { page, limit, examId, onlineOnly, sort, search } = query;
        const skip = (page - 1) * limit;

        const baseQb = () => {

            const qb = this.userRepository
                .createQueryBuilder('user')
                .innerJoin('user.profile', 'profile')
                .innerJoin('profile.exam', 'exam')
                .andWhere('user.isEmailVerified = true')
                .andWhere('user.id != :userId', { userId })
                .andWhere('profile.examId IS NOT NULL')

            if (examId) {
                qb.andWhere('profile.examId = :examId', { examId });
            }

            if (sort) {
                qb.andWhere('profile.role = :role', { role: sort })
            }


            if (search) {
                qb.andWhere(
                    '(profile.firstName ILIKE :search OR profile.lastName ILIKE :search OR exam.name ILIKE :search)',
                    { search: `%${search}%` },
                );
            }

            return qb;

        }


        const total = await baseQb().getCount();

        const rows = await baseQb()
            .select('user.id', 'id')
            .orderBy('user.createdAt', 'DESC')
            .addOrderBy('user.id', 'DESC')
            .offset(skip)
            .limit(limit)
            .getRawMany<{ id: string }>();

        const pageUserIds = rows.map((r) => r.id);

        if (!pageUserIds.length) {
            return {
                data: [],
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
            };
        }


        const [users, connections, focusedSecondsRows] = await Promise.all([
            this.userRepository.find({
                where: { id: In(pageUserIds) },
                relations: { profile: { exam: true } },
            }),

            this.prepMateConnectionRepository.find({
                where: [
                    { userLow: { id: userId }, userHigh: { id: In(pageUserIds) } },
                    { userHigh: { id: userId }, userLow: { id: In(pageUserIds) } },
                ],
                relations: { userLow: true, userHigh: true, requester: true },
            }),

            this.studySessionRepository
                .createQueryBuilder('session')
                .select('session."userId"', 'userId')
                .addSelect('SUM(session."actualStudySeconds")', 'totalSeconds')
                .where('session."userId" IN (:...pageUserIds)', { pageUserIds })
                .andWhere('session.status = :status', { status: StudySession.COMPLETED })
                .groupBy('session."userId"')
                .getRawMany(),
        ]);

        const usersById = new Map(users.map((u) => [u.id, u]));
        const orderedUsers = pageUserIds.map((id) => usersById.get(id)).filter(Boolean) as UserEntity[];

        const connectionMap = new Map<string, PrepMateConnectionEntity>();

        for (const conn of connections) {
            const otherUserId = conn.userLow.id === userId ? conn.userHigh.id : conn.userLow.id;
            connectionMap.set(otherUserId, conn);
        }

        const focusedMinutesMap = new Map<string, number>();

        for (const row of focusedSecondsRows) {
            focusedMinutesMap.set(row.userId, Math.floor(Number(row.totalSeconds) / 60));
        }


        const transformedResponse = orderedUsers.map((user) => {

            const conn = connectionMap.get(user.id);

            let prepMateStatus: 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'ACCEPTED' | 'DECLINED' = 'NONE';

            if (conn) {
                if (conn.status === ConnectionStatus.ACCEPTED) {
                    prepMateStatus = 'ACCEPTED';
                }
                else if (conn.status === ConnectionStatus.PENDING) {
                    prepMateStatus = conn.requester.id === userId ? 'PENDING_SENT' : 'PENDING_RECEIVED';
                }
            }

            return {
                user: {
                    id: user.id,
                    email: user.email
                },
                profile: {
                    name: `${user.profile.firstName} ${user.profile.lastName}`,
                    role: user.profile.role,
                    bio:user.profile.bio,
                    avatar: user.profile.avatar
                },
                exam: {
                    id: user.profile.exam.id,
                    name: user.profile.exam.name
                },

                connection: {
                    status: prepMateStatus,
                    connectionId: conn?.id ?? null
                },

                totalFocusedMinutes: focusedMinutesMap.get(user.id) ?? 0

            }
        }
        );

        return {
            data: transformedResponse,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }

}

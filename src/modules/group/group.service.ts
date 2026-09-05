import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupEntity } from './entities/group.entity';
import { Repository } from 'typeorm';
import { GroupMemberEntity } from './entities/group-member.entity';
import { DataSource } from 'typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { GroupRole } from './enums/group-role.enum';
import { PaginationQueryDto } from 'src/shared/dto/pagination-query.dto';
import { ConversationEntity } from '../chat/entities/conversation.entity';
import { ConversationType } from '../chat/enums/conversation-type.enum';
import { ConversationParticipantEntity } from '../chat/entities/conversation-participant.entity';
import { GROUP_MESSAGES } from 'src/shared/constants/messages/group.messages';

@Injectable()
export class GroupService {

    constructor(@InjectRepository(GroupEntity) private readonly groupRepository: Repository<GroupEntity>, @InjectRepository(GroupMemberEntity) private readonly groupMemberRepository: Repository<GroupMemberEntity>, private readonly dataSource: DataSource) { }

    async createGroup(user: UserEntity, dto: CreateGroupDto) {

        const { name, description } = dto;

        return this.dataSource.transaction(async (manager) => {

            const group = manager.create(GroupEntity, {
                name,
                description,
                createdBy: {
                    id: user.id
                }
            });

            const savedGroup = await manager.save(group);

            const membership = manager.create(GroupMemberEntity, {
                role: GroupRole.ADMIN,
                group: { id: savedGroup.id },
                user: { id: user.id }
            });

            await manager.save(membership);

            const conversation = manager.create(ConversationEntity, {
                type: ConversationType.GROUP,
                group: {
                    id: savedGroup.id
                }
            });

            const savedConversation = await manager.save(conversation);

            const participant = manager.create(ConversationParticipantEntity, {
                conversation: {
                    id: savedConversation.id
                },
                user: {
                    id: user.id
                }
            });

            await manager.save(participant);

            return {
                data: {
                    id: savedGroup.id,
                    name: savedGroup.name,
                    description: savedGroup.description ?? null,
                    createdAt: savedGroup.createdAt,
                    memberCount: 1,
                    isJoined: true,
                    myRole: GroupRole.ADMIN,
                    conversationId: savedConversation.id

                }
            }

        });

    }

    async getGroups(userId: string, query: PaginationQueryDto) {

        const { page, limit } = query;
        const skip = (page - 1) * limit;

        const queryBuilder = this.groupRepository
            .createQueryBuilder('group')

            .leftJoin('group.members', 'member')

            .where('group.isDeleted = :isDeleted', { isDeleted: false })

            .addSelect('COUNT(DISTINCT member.id)', 'memberCount')

            .addSelect(
                `
                                EXISTS (

                                SELECT 1 FROM group_members gm
                                WHERE gm."groupId" = "group".id
                                AND gm."userId" = :userId

                                )`,
                'isJoined'
            )

            .addSelect(
                `
                                (SELECT gm2.role FROM group_members gm2
                                   WHERE gm2."groupId" = "group".id
                                   AND gm2."userId" = :userId
                                )
                                `,
                'myRole'
            )

            .setParameter('userId', userId)

            .orderBy('group.createdAt', 'DESC')

            .groupBy('group.id')

            .skip(skip)
            .take(limit)


        const { entities, raw } = await queryBuilder.getRawAndEntities();


        const transformedGroups = entities.map((group, idx) => ({
            id: group.id,
            name: group.name,
            description: group.description ?? null,
            createdAt: group.createdAt,
            memberCount: Number(raw[idx].memberCount),
            isJoined: raw[idx].isJoined === true || raw[idx].isJoined === 'true',
            myRole: raw[idx].myRole ?? null,
        }));

        const total = await this.groupRepository.count({ where: { isDeleted: false } });

        return {
            data: {
                groups: transformedGroups
            },
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        }


    }

    async joinGroup(userId: string, groupId: string) {

        const group = await this.groupRepository.findOne({
            where: {
                id: groupId,
                isDeleted: false
            },
            relations: {
                conversation: true
            }
        });

        if (!group) {
            throw new NotFoundException(GROUP_MESSAGES.GROUP_NOT_FOUND);
        }

        return this.dataSource.transaction(async (manager) => {

            const membership = manager.create(GroupMemberEntity, {
                group: {
                    id: groupId
                },
                user: {
                    id: userId
                },
                role: GroupRole.MEMBER
            });

            try {

                await manager.save(membership);

            }
            catch (err: any) {

                if (err.code === '23505') {
                    throw new ConflictException(GROUP_MESSAGES.ALREADY_MEMBER_OF_GROUP);
                }
                throw err;

            }

            if (group.conversation) {

                const participant = manager.create(ConversationParticipantEntity, {
                    conversation: { id: group.conversation.id },
                    user: { id: userId }
                });
                await manager.save(participant);

            }

            const memberCount = await manager.count(GroupMemberEntity, {
                where: { group: { id: groupId } }
            });

            return {

                data: {
                    groupId,
                    isJoined: true,
                    myRole: GroupRole.MEMBER,
                    memberCount
                }

            }

        })
    }

    async leaveGroup(userId: string, groupId: string) {

        const membership = await this.groupMemberRepository.findOne({
            where: {
                group: {
                    id: groupId
                },
                user: {
                    id: userId
                }
            }
        });

        if (!membership) {
            throw new NotFoundException(GROUP_MESSAGES.NOT_MEMBER_OF_GROUP);
        }

        if (membership.role === GroupRole.ADMIN) {

            const adminCount = await this.groupMemberRepository.count({
                where: {
                    group: {
                        id: groupId
                    },
                    role: GroupRole.ADMIN
                }
            });

            if (adminCount === 1) {
                throw new ConflictException(GROUP_MESSAGES.PROMOTE_ANOTHER_MEMBER_BEFORE_LEAVING);
            }

        }

        const group = await this.groupRepository.findOne({
            where:{
                id:groupId
            },
            relations:{
                conversation:true
            }
        });

        return await this.dataSource.transaction(async (manager)=>{

            await manager.delete(GroupMemberEntity,{
                group:{
                    id:groupId
                },
                user:{
                    id:userId
                }
            });

            if(group?.conversation){
                await manager.delete(ConversationParticipantEntity,{
                    conversation:{
                        id:group.conversation.id
                    },
                    user:{
                        id:userId
                    }
                })
            }

            return {
                data: {
                    groupId,
                    isJoined: false
                }
            }

        })

    }

    async promoteMember(groupId: string, targetUserId: string, userId: string) {

        const requesterMembership = await this.groupMemberRepository.findOne({
            where: {
                group: {
                    id: groupId
                },
                user: {
                    id: userId
                },
                role: GroupRole.ADMIN
            }
        });

        if (!requesterMembership) {
            throw new ForbiddenException(GROUP_MESSAGES.ONLY_ADMIN_CAN_PROMOTE);
        }

        const targetMembership = await this.groupMemberRepository.findOne({
            where: {
                group: {
                    id: groupId
                },
                user: {
                    id: targetUserId
                }
            }
        });

        if (!targetMembership) {
            throw new NotFoundException('That user is not a member of this group');
        }

        if (targetMembership.role === GroupRole.ADMIN) {
            throw new ConflictException('This user is already an admin');
        }

        targetMembership.role = GroupRole.ADMIN;
        await this.groupMemberRepository.save(targetMembership);

        return {
            data: {
                userId: targetUserId,
                groupId,
                role: GroupRole.ADMIN
            }
        }

    }




}

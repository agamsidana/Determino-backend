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
import { MessageEntity } from '../chat/entities/message.entity';
import { MessageType } from '../chat/enums/message-type.enum';
import { SystemEventType } from '../chat/enums/systemEvent-type.enum';
import { UpdateGroupDto } from './dto/update-group.dto';
import { PresenceService } from '../chat/presence.service';
import { GetGroupQueryDto } from './dto/get-group-query.dto';
import { GroupFilter } from './enums/group-filter.enum';
import { SelectQueryBuilder } from 'typeorm/browser';

@Injectable()
export class GroupService {

    constructor(@InjectRepository(GroupEntity) private readonly groupRepository: Repository<GroupEntity>, @InjectRepository(GroupMemberEntity) private readonly groupMemberRepository: Repository<GroupMemberEntity>, private readonly presenceService: PresenceService, private readonly dataSource: DataSource) { }

    async createGroup(user: UserEntity, dto: CreateGroupDto) {

        const { name, description, color } = dto;

        return this.dataSource.transaction(async (manager) => {

            const group = manager.create(GroupEntity, {
                name,
                description,
                color,
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
                    color: savedGroup.color,
                    createdAt: savedGroup.createdAt,
                    memberCount: 1,
                    isJoined: true,
                    myRole: GroupRole.ADMIN,
                    conversationId: savedConversation.id

                }
            }

        });

    }

    async updateGroup(groupId: string, userId: string, dto: UpdateGroupDto) {

        const { name, description } = dto;

        const group = await this.groupRepository.findOne({
            where: {
                id: groupId,
                members: {
                    role: GroupRole.ADMIN,
                    user: {
                        id: userId
                    }
                }
            }
        });

        if (!group) {
            throw new NotFoundException(GROUP_MESSAGES.GROUP_NOT_FOUND);
        }

        if (name !== undefined) {
            group.name = name;
        }

        if (description !== undefined) {
            group.description = description;
        }

        const updatedGroup = await this.groupRepository.save(group);

        return {
            data: {
                id: updatedGroup.id,
                name: updatedGroup.name,
                description: updatedGroup.description
            }
        }

    }

    async getGroups(userId: string, query: GetGroupQueryDto) {

        const { page, limit,filter } = query;
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

            .addSelect(
                `(SELECT c.id FROM conversations c WHERE c."groupId" = "group".id)`,
                'conversationId'
            )

            .setParameter('userId', userId)

            .orderBy('group.createdAt', 'DESC')

            .groupBy('group.id')

            .skip(skip)
            .take(limit)

        this.applyGroupFilter(queryBuilder,filter,userId);

        const { entities, raw } = await queryBuilder.getRawAndEntities();

        const countQb = this.groupRepository
                        .createQueryBuilder('group')
                        .where('group.isDeleted = :isDeleted',{isDeleted:false});
        this.applyGroupFilter(countQb,filter,userId);
        const total = await countQb.getCount();


        const transformedGroups = entities.map((group, idx) => ({
            id: group.id,
            name: group.name,
            description: group.description ?? null,
            color: group.color,
            createdAt: group.createdAt,
            memberCount: Number(raw[idx].memberCount),
            isJoined: raw[idx].isJoined === true || raw[idx].isJoined === 'true',
            myRole: raw[idx].myRole ?? null,
            conversationId: raw[idx].conversationId ?? null,
        }));

        return {
            data: {
                groups: transformedGroups
            },
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        }


    }

    async getTrendingGroups(limit: number = 3, userId: string) {

        const safeLimit = Math.min(Math.max(limit, 1), 10);

        const rows = await this.groupRepository
            .createQueryBuilder('group')
            .select('group.id', 'id')
            .addSelect('group.name', 'name')
            .addSelect('group.description', 'description')
            .addSelect(
                `(SELECT COUNT(*) FROM group_members gm WHERE gm."groupId" = "group".id)`,
                'memberCount',
            )
            .addSelect(
                `(SELECT c.id FROM conversations c WHERE c."groupId" = "group".id)`,
                'conversationId',
            )
            .where('group.isDeleted = :isDeleted', { isDeleted: false })
            .andWhere(
                `NOT EXISTS (
                SELECT 1 FROM group_members mine
                WHERE mine."groupId" = "group".id AND mine."userId" = :userId
            )`,
                { userId },
            )
            .orderBy('"memberCount"', 'DESC')
            .addOrderBy('group.createdAt', 'ASC')
            .limit(safeLimit)
            .getRawMany();

        return {
            data:{
                groups:rows.map((group)=>({
                    id:group.id,
                    name:group.name,
                    description:group.description ?? null,
                    memberCount:Number(group.memberCount),
                    conversationId:group.conversationId ?? null
                })),
            }
        };

    }

    async getGroupById(userId: string, groupId: string) {

        const queryBuilder = this.groupRepository
            .createQueryBuilder('group')

            .leftJoin('group.members', 'member')

            .where('group.id = :groupId', { groupId })
            .andWhere('group.isDeleted = :isDeleted', { isDeleted: false })

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

            .addSelect(
                `(SELECT c.id FROM conversations c WHERE c."groupId" = "group".id)`,
                'conversationId'
            )

            .setParameter('userId', userId)
            .groupBy('group.id')

        const { entities, raw } = await queryBuilder.getRawAndEntities();

        if (!entities.length) {
            throw new NotFoundException(GROUP_MESSAGES.GROUP_NOT_FOUND);
        }

        const group = entities[0];
        const data = raw[0];

        return {
            data: {
                id: group.id,
                name: group.name,
                description: group.description ?? null,
                color: group.color,
                createdAt: group.createdAt,
                memberCount: Number(data.memberCount),
                isJoined: data.isJoined === true || data.isJoined === 'true',
                myRole: data.myRole ?? null,
                conversationId: data.conversationId ?? null,
            },
        };

    }

    async getGroupPresence(groupId: string, userId: string) {

        const isMember = await this.groupMemberRepository.findOne({
            where: {
                group: { id: groupId },
                user: { id: userId }
            }
        });

        if (!isMember) {
            throw new ForbiddenException(GROUP_MESSAGES.NOT_MEMBER_OF_GROUP)
        }

        const members = await this.groupMemberRepository.find({
            where: {
                group: {
                    id: groupId
                }
            },
            relations: {
                user: {
                    profile: true
                }
            }
        });

        const onlineUsers = members
            .filter((member) =>
                this.presenceService.isOnline(member.user.id),
            )
            .map((member) => ({
                id: member.user.id,
                firstName: member.user.profile.firstName,
                lastName: member.user.profile.lastName,
                avatar: member.user.profile.avatar,
                role: member.role,
            }));

        return {
            data: {
                onlineUsers,
            },
        };

    }

    async joinGroup(user: UserEntity, groupId: string) {

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
                    id: user.id
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

            let systemMessage: null | MessageEntity = null;

            if (group.conversation) {

                const participant = manager.create(ConversationParticipantEntity, {
                    conversation: { id: group.conversation.id },
                    user: { id: user.id }
                });
                await manager.save(participant);

                const sysMsg = manager.create(MessageEntity, {
                    type: MessageType.SYSTEM,
                    systemEventType: SystemEventType.USER_JOINED,
                    conversation: {
                        id: group.conversation.id
                    },
                    sender: {
                        id: user.id
                    }
                });

                systemMessage = await manager.save(sysMsg);

            }

            const memberCount = await manager.count(GroupMemberEntity, {
                where: { group: { id: groupId } }
            });

            return {

                data: {
                    groupId,
                    conversationId: group.conversation.id ?? null,
                    isJoined: true,
                    myRole: GroupRole.MEMBER,
                    memberCount,
                    systemMessage: systemMessage ? {
                        id: systemMessage.id,
                        type: MessageType.SYSTEM,
                        systemEventType: SystemEventType.USER_JOINED,
                        createdAt: systemMessage.createdAt,
                        sender: {
                            id: user.id,
                            name: `${user.profile.firstName} ${user.profile.lastName}`
                        }
                    } : null
                }

            }

        })
    }

    async leaveGroup(user: UserEntity, groupId: string) {

        const membership = await this.groupMemberRepository.findOne({
            where: {
                group: {
                    id: groupId
                },
                user: {
                    id: user.id
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
            where: {
                id: groupId,
                isDeleted: false
            },
            relations: {
                conversation: true
            }
        });

        if (!group) throw new NotFoundException(GROUP_MESSAGES.GROUP_NOT_FOUND)

        return await this.dataSource.transaction(async (manager) => {

            await manager.delete(GroupMemberEntity, {
                group: {
                    id: groupId
                },
                user: {
                    id: user.id
                }
            });

            let systemMessage: null | MessageEntity = null;

            if (group?.conversation) {
                await manager.delete(ConversationParticipantEntity, {
                    conversation: {
                        id: group.conversation.id
                    },
                    user: {
                        id: user.id
                    }
                });

                const sysMsg = manager.create(MessageEntity, {
                    type: MessageType.SYSTEM,
                    systemEventType: SystemEventType.USER_LEFT,
                    conversation: {
                        id: group.conversation.id
                    },
                    sender: {
                        id: user.id
                    }
                });

                systemMessage = await manager.save(sysMsg);
            }

            return {
                data: {
                    groupId,
                    conversationId: group.conversation.id ?? null,
                    isJoined: false,
                    systemMessage: systemMessage ? {
                        id: systemMessage.id,
                        type: MessageType.SYSTEM,
                        systemEventType: SystemEventType.USER_LEFT,
                        createdAt: systemMessage.createdAt,
                        sender: {
                            id: user.id,
                            name: `${user.profile.firstName} ${user.profile.lastName}`
                        }
                    } : null
                }
            }

        })

    }

    async getGroupMembers(groupId: string, userId: string, query: PaginationQueryDto) {

        const { page, limit } = query;

        const skip = (page - 1) * limit

        const isMember = await this.groupMemberRepository.findOne({
            where: {
                group: {
                    id: groupId,
                },
                user: {
                    id: userId,
                },
            },
        });

        if (!isMember) {
            throw new ForbiddenException(
                GROUP_MESSAGES.NOT_MEMBER_OF_GROUP,
            );
        }

        const [members, total] = await this.groupMemberRepository.findAndCount({
            where: {
                group: {
                    id: groupId
                }
            },
            relations: {
                user: {
                    profile: true
                }
            },
            take: limit,
            skip
        });

        const transformedResponse = members.map((member) => ({
            id: member.user.id,
            name: `${member.user.profile.firstName} ${member.user.profile.lastName}`,
            role: member.role
        }));


        return {
            data: {
                members: transformedResponse,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        };

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
            throw new NotFoundException(GROUP_MESSAGES.USER_NOT_MEMBER_OF_GROUP);
        }

        if (targetMembership.role === GroupRole.ADMIN) {
            throw new ConflictException(GROUP_MESSAGES.USER_ALREADY_ADMIN);
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

    private applyGroupFilter(qb:SelectQueryBuilder<GroupEntity>,filter:GroupFilter | undefined , userId:string){

        if(!filter) return qb;

        const memberShip = 'SELECT 1 FROM group_members gm WHERE gm."groupId" = "group".id AND gm."userId" = :filterUserId';

        if(filter === GroupFilter.MY_GROUPS){
            qb.andWhere(`EXISTS (${memberShip})`, { filterUserId: userId });
        }
        else{
            qb.andWhere(`NOT EXISTS (${memberShip})`, { filterUserId: userId });
        }

        return qb;

    }




}

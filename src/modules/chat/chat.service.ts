import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { MessageEntity } from './entities/message.entity';
import { SendMessageDto } from './dto/send-message.dto';
import { ConversationParticipantEntity } from './entities/conversation-participant.entity';
import { UserEntity } from '../user/entities/user.entity';
import { SystemEventType } from './enums/systemEvent-type.enum';
import { MessageType } from './enums/message-type.enum';
import { ConversationType } from './enums/conversation-type.enum';
import { DirectChatQueryDto } from './dto/direct-chat-query.dto';

@Injectable()
export class ChatService {

    constructor(@InjectRepository(ConversationParticipantEntity) private readonly conversationParticipantRepository: Repository<ConversationParticipantEntity>, @InjectRepository(MessageEntity) private readonly messageRepository: Repository<MessageEntity>) { }

    async sendMessage(conversationId: string, sender: UserEntity, dto: SendMessageDto) {

        const { content } = dto

        const participant = await this.conversationParticipantRepository.findOne({
            where: {
                conversation: {
                    id: conversationId
                },
                user: {
                    id: sender.id
                }
            }
        });

        if (!participant) {
            throw new ForbiddenException('You are not a participant in this conversation');
        }

        const message = this.messageRepository.create({
            content,
            conversation: {
                id: conversationId
            },
            sender: {
                id: sender.id
            }
        });

        const savedMessage = await this.messageRepository.save(message);

        return {
            data: {
                id: savedMessage.id,
                content: savedMessage.content,
                isDeleted: false,
                createdAt: savedMessage.createdAt,
                sender: {
                    id: sender.id,
                    name: `${sender.profile.firstName} ${sender.profile.lastName}`
                }
            }
        }

    }

    async getDirectChat(userId: string, query: DirectChatQueryDto) {

        const { limit, lastActivityAt, conversationId } = query;


        //lastActivityAt: latest message time if conversation has messages , conversation.createdAt if it has no messages
        const lastActivityExpression = `
                    COALESCE(
                        (
                            SELECT m."createdAt"
                            FROM messages m
                            WHERE m."conversationId" = conversation.id
                            ORDER BY m."createdAt" DESC
                            LIMIT 1
                        ),
                        conversation."createdAt"
                    )
                `;

        // 1. Get conversations belonging to the current user
        const conversationQuery = this.conversationParticipantRepository
            .createQueryBuilder('participant')
            .innerJoin(
                'participant.conversation',
                'conversation',
            )
            .select(
                'conversation.id',
                'conversationId',
            )
            .addSelect(
                lastActivityExpression,
                'lastActivityAt',
            )
            .where(
                'participant.user.id = :userId',
                { userId },
            )
            .andWhere(
                'conversation.type = :type',
                {
                    type: ConversationType.DIRECT,
                },
            );


        //2. Cursor condition Ordering: lastActivityAt DESC conversationId DESC The next page starts AFTER the cursor position.
        if (lastActivityAt && conversationId) {
            conversationQuery.andWhere(
                `(
                ${lastActivityExpression} < :cursorDate
                OR (
                    ${lastActivityExpression} = :cursorDate
                    AND conversation.id < :cursorConversationId
                )
            )`,
                {
                    cursorDate: lastActivityAt,
                    cursorConversationId: conversationId,
                },
            );
        }


        // 3. Order + fetch one extra
        const conversations = await conversationQuery
            .orderBy(
                lastActivityExpression,
                'DESC',
            )
            .addOrderBy(
                'conversation.id',
                'DESC',
            )
            .take(limit + 1)
            .getRawMany();


        // 4. Pagination information
        const hasMore =
            conversations.length > limit;

        const pageConversations =
            conversations.slice(0, limit);

        if (!pageConversations.length) {
            return {
                data: [],
                pagination: {
                    hasMore: false,
                    nextCursor: null,
                },
            };
        }

        // 5. Get conversation IDs for this page
        const conversationIds = pageConversations.map((conversation) => conversation.conversationId);


        // 6. Get participants of ONLY these conversations
        const participants = await this.conversationParticipantRepository.find({
            where: {
                conversation: {
                    id: In(conversationIds),
                },
            },
            relations: {
                user: {
                    profile: true,
                },
                conversation: true,
            },
        });

        // 7. Get the latest message for every conversation
        const latestMessages = await this.messageRepository
            .createQueryBuilder('message')
            .innerJoinAndSelect('message.conversation', 'conversation')
            .where('conversation.id IN (:...conversationIds)', { conversationIds })
            .orderBy('conversation.id', 'ASC')
            .addOrderBy('message.createdAt', 'DESC')
            .distinctOn(['conversation.id'])
            .getMany();

        // 8. Create participant lookup conversationId -> other user
        const otherUserMap =
            new Map<string, UserEntity>();

        for (const participant of participants) {
            if (participant.user.id === userId) {
                continue;
            }

            otherUserMap.set(
                participant.conversation.id,
                participant.user,
            );
        }


        // 9. Create latest-message lookup conversationId -> latest message
        const latestMessageMap =
            new Map<string, MessageEntity>();

        for (const message of latestMessages) {
            latestMessageMap.set(
                message.conversation.id,
                message,
            );
        }

        //10. Build response
        const data = pageConversations.map(
            (conversation) => {
                const conversationId =
                    conversation.conversationId;

                const otherUser =
                    otherUserMap.get(
                        conversationId,
                    );

                if (!otherUser) {
                    throw new InternalServerErrorException(
                        `Direct conversation ${conversationId} has no other participant`,
                    );
                }

                const latestMessage =
                    latestMessageMap.get(
                        conversationId,
                    );

                return {
                    conversationId,

                    user: {
                        id: otherUser.id,
                        firstName:
                            otherUser.profile.firstName,
                        lastName:
                            otherUser.profile.lastName,
                        avatar:
                            otherUser.profile.avatar,
                    },

                    lastMessage:
                        latestMessage
                            ? {
                                id:
                                    latestMessage.id,

                                content:
                                    latestMessage.isDeleted
                                        ? null
                                        : latestMessage.content,

                                createdAt:
                                    latestMessage.createdAt,

                                isDeleted:
                                    latestMessage.isDeleted,

                                type:
                                    latestMessage.type,
                            }
                            : null,
                };
            },
        );

        // 11. Cursor for the next request
        const lastConversation =
            pageConversations[
            pageConversations.length - 1
            ];

        const nextCursor = hasMore
            ? {
                lastActivityAt:
                    lastConversation.lastActivityAt,

                conversationId:
                    lastConversation.conversationId,
            }
            : null;

        //12. Final response
        return {
            data,

            pagination: {
                hasMore,
                nextCursor,
            },
        };

    }

    async getMessages(conversationId: string, user: UserEntity, before?: string, limit = 30) {

        const participant = await this.conversationParticipantRepository.findOne({
            where: {
                conversation: {
                    id: conversationId
                },
                user: {
                    id: user.id
                }
            }
        });

        if (!participant) {
            throw new ForbiddenException('You are not a participant in this conversation');
        }

        const queryBuilder = this.messageRepository
            .createQueryBuilder('message')
            .leftJoinAndSelect('message.sender', 'sender')
            .leftJoinAndSelect('sender.profile', 'profile')
            .where('message.conversation.id = :conversationId', { conversationId })
            .orderBy('message.createdAt', 'DESC')
            .take(limit);

        if (before) {

            const cursorMessage = await this.messageRepository.findOne({
                where: {
                    id: before
                }
            })

            if (cursorMessage) {
                queryBuilder.andWhere('message.createdAt < :cursorDate', { cursorDate: cursorMessage.createdAt });
            }

        };

        const messages = await queryBuilder.getMany();

        return {
            data: {
                messages: messages.map((m)=> this.transformMessage(m)).reverse(),   // flip back to (oldest first) for UI rendering
                hasMore: messages.length === limit
            }
        }


    }

    async deleteMessage(conversationId: string, messageId: string, userId: string) {

        const participant = await this.conversationParticipantRepository.findOne({
            where: {
                conversation: {
                    id: conversationId
                },
                user: {
                    id: userId
                }
            }
        });

        if (!participant) {
            throw new ForbiddenException('You are not a participant in this conversation');
        }

        const message = await this.messageRepository.findOne({
            where: {
                id: messageId,
                conversation: {
                    id: conversationId
                },
                sender: {
                    id: userId
                },
                isDeleted: false
            },
        });

        if (!message) {
            throw new NotFoundException('Message not found');
        }

        message.isDeleted = true;

        await this.messageRepository.save(message);

        return {
            data: {
                id: message.id,
                isDeleted: true
            }
        }

    }

    async createSystemMessage(conversationId: string, userId: string, eventType: SystemEventType) {

        const message = this.messageRepository.create({
            type: MessageType.SYSTEM,
            systemEventType: eventType,
            conversation: {
                id: conversationId
            },
            sender: {
                id: userId
            }
        });

        const savedMessage = await this.messageRepository.save(message);

        return {
            id: savedMessage.id,
            type: MessageType.SYSTEM,
            systemEventType: savedMessage.systemEventType,
            createdAt: savedMessage.createdAt,
            sender: { id: userId },
        };

    }

    private transformMessage(m: MessageEntity) {

        const senderName = `${m.sender.profile.firstName} ${m.sender.profile.lastName}`;

        if (m.type === MessageType.SYSTEM) {
            return {
                id: m.id,
                type: MessageType.SYSTEM,
                systemEventType: m.systemEventType,
                createdAt: m.createdAt,
                sender: {
                    id: m.sender.id,
                    name: senderName
                }
            };
        }

        return {
            id: m.id,
            type: MessageType.TEXT,
            content: m.isDeleted ? null : m.content,
            isDeleted: m.isDeleted,
            createdAt: m.createdAt,
            sender: {
                id: m.sender.id,
                name: senderName
            }
        };

}

}

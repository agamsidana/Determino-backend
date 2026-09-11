import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageEntity } from './entities/message.entity';
import { SendMessageDto } from './dto/send-message.dto';
import { ConversationParticipantEntity } from './entities/conversation-participant.entity';
import { UserEntity } from '../user/entities/user.entity';
import { SystemEventType } from './enums/systemEvent-type.enum';
import { MessageType } from './enums/message-type.enum';

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

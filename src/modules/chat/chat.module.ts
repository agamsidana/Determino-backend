import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationEntity } from './entities/conversation.entity';
import { ConversationParticipantEntity } from './entities/conversation-participant.entity';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { MessageEntity } from './entities/message.entity';
import { MessageGateway } from './gateway/message.gateway';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../user/entities/user.entity';
import { PresenceService } from './presence.service';

@Module({
    imports:[TypeOrmModule.forFeature([ConversationEntity,ConversationParticipantEntity,MessageEntity,UserEntity])],
    providers: [ChatService,MessageGateway,JwtService,PresenceService],
    controllers: [ChatController],
    exports:[MessageGateway,PresenceService]
})
export class ChatModule {}

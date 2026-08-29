import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationEntity } from './entities/conversation.entity';
import { ConversationParticipantEntity } from './entities/conversation-participant.entity';

@Module({
    imports:[TypeOrmModule.forFeature([ConversationEntity,ConversationParticipantEntity])]
})
export class ChatModule {}

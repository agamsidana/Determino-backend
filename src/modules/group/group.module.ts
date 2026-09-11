import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupEntity } from './entities/group.entity';
import { GroupMemberEntity } from './entities/group-member.entity';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports:[TypeOrmModule.forFeature([GroupEntity,GroupMemberEntity]),ChatModule],
  providers: [GroupService],
  controllers: [GroupController]
})
export class GroupModule {}

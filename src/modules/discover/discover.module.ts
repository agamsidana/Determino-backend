import { Module } from '@nestjs/common';
import { DiscoverService } from './discover.service';
import { DiscoverController } from './discover.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { PrepMateConnectionEntity } from '../connection/entities/prepmate-connection.entity';
import { StudySessionEntity } from '../study-session/entities/study-session.entity';

@Module({
  imports:[TypeOrmModule.forFeature([UserEntity,PrepMateConnectionEntity,StudySessionEntity])],
  providers: [DiscoverService],
  controllers: [DiscoverController]
})
export class DiscoverModule {}

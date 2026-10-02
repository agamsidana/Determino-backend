import { Module } from '@nestjs/common';
import { StudySessionService } from './study-session.service';
import { StudySessionController } from './study-session.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudySessionEntity } from './entities/study-session.entity';
import { ChallengeModule } from '../challenge/challenge.module';

@Module({
  imports: [TypeOrmModule.forFeature([StudySessionEntity]),ChallengeModule],
  providers: [StudySessionService],
  controllers: [StudySessionController],
  exports:[StudySessionService]
})
export class StudySessionModule { }

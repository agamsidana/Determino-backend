import { Module } from '@nestjs/common';
import { StudySessionService } from './study-session.service';
import { StudySessionController } from './study-session.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudySessionEntity } from './entities/study-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StudySessionEntity])],
  providers: [StudySessionService],
  controllers: [StudySessionController]
})
export class StudySessionModule { }

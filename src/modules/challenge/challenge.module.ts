import { Module } from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { ChallengeController } from './challenge.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChallengeEntity } from './entities/challenge.entity';
import { ChallengeParticipantEntity } from './entities/challenge-participant.entity';
import { ChallengeProgressEntity } from './entities/challenge-progress.entity';

@Module({
  imports:[TypeOrmModule.forFeature([ChallengeEntity,ChallengeParticipantEntity,ChallengeProgressEntity])],
  providers: [ChallengeService],
  controllers: [ChallengeController],
  exports:[ChallengeService]
})
export class ChallengeModule {}

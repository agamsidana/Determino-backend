import { Module } from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { ChallengeController } from './challenge.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChallengeEntity } from './entities/challenge.entity';
import { ChallengeParticipantEntity } from './entities/challenge-participant.entity';
import { ChallengeProgressEntity } from './entities/challenge-progress.entity';
import { QuizEntity } from './entities/quiz.entity';
import { QuizAttemptEntity } from './entities/quiz-attempt.entity';
import { QuizQuestionEntity } from './entities/quiz-question.entity';
import { QuizAttemptAnswerEntity } from './entities/quiz-attempt-answer.entity';

@Module({
  imports:[TypeOrmModule.forFeature([ChallengeEntity,ChallengeParticipantEntity,ChallengeProgressEntity,QuizEntity,QuizQuestionEntity,QuizAttemptEntity,QuizAttemptAnswerEntity])],
  providers: [ChallengeService],
  controllers: [ChallengeController],
  exports:[ChallengeService]
})
export class ChallengeModule {}

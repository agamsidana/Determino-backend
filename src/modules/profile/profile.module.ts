import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileEntity } from './entities/profile.entity';
import { ExamModule } from '../exam/exam.module';
import { GoalModule } from '../goal/goal.module';
import { UserEntity } from '../user/entities/user.entity';
import { AvatarUploadEntity } from './entities/avatar-upload.entity';
import { ConnectionModule } from '../connection/connection.module';
import { StudySessionModule } from '../study-session/study-session.module';
import { PostModule } from '../post/post.module';

@Module({
  imports:[TypeOrmModule.forFeature([ProfileEntity,UserEntity,AvatarUploadEntity]),ExamModule,GoalModule,ConnectionModule,StudySessionModule,PostModule],
  providers: [ProfileService],
  controllers: [ProfileController],
  exports:[ProfileService]
})
export class ProfileModule {}

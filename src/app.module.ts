import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { UserModule } from './modules/user/user.module';
import { ProfileModule } from './modules/profile/profile.module';
import { AuthModule } from './modules/auth/auth.module';
import { ExamModule } from './modules/exam/exam.module';
import { GoalModule } from './modules/goal/goal.module';
import { StudySessionModule } from './modules/study-session/study-session.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: databaseConfig
    }),
    
    UserModule,
    ProfileModule,
    AuthModule,
    ExamModule,
    GoalModule,
    StudySessionModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }

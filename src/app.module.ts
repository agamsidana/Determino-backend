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
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PostModule } from './modules/post/post.module';
import { SupabaseModule } from './shared/supabase/supabase.module';
import { GroupModule } from './modules/group/group.module';
import { ChatModule } from './modules/chat/chat.module';
import { MailModule } from './modules/mail/mail.module';
import { ChallengeModule } from './modules/challenge/challenge.module';
import { ConnectionModule } from './modules/connection/connection.module';
import { DiscoverModule } from './modules/discover/discover.module';
import { UserThrottlerGuard } from './shared/guards/user-throttler.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: databaseConfig
    }),

    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60_000,
          limit: 100
        }
      ]
    }),

    SupabaseModule,
    UserModule,
    ProfileModule,
    AuthModule,
    ExamModule,
    GoalModule,
    StudySessionModule,
    AnalyticsModule,
    PostModule,
    GroupModule,
    ChatModule,
    MailModule,
    ChallengeModule,
    ConnectionModule,
    DiscoverModule
  ],
  controllers: [],
  providers: [{
    provide: APP_GUARD,
    useClass: UserThrottlerGuard,
  }],
})
export class AppModule { }

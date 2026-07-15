import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { ProfileModule } from '../profile/profile.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

console.log('JWT_SECRET:', process.env.JWT_SECRET);

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '8h'
        }
      })
    }),
    UserModule,
    ProfileModule
  ],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule { }

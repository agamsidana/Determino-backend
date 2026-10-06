import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUserResponseDto } from './dto/current-user-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { Throttle } from '@nestjs/throttler';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    @Throttle({
        default:{
            limit:7,
            ttl:60_000
        }
    })
    @Post('signup')
    async signup(@Body() dto: SignUpDto) {
        return await this.authService.signup(dto);
    }

    @Throttle({
        default:{
            limit:7,
            ttl:60_000
        }
    })
    @Post('login')
    async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
        return await this.authService.login(dto);
    }

    @Post('google')
    async loginWithGoogle(@Body() dto: GoogleAuthDto) {
        return await this.authService.loginWithGoogle(dto.idToken);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('me')
    async me(@CurrentUser() user: UserEntity): Promise<CurrentUserResponseDto> {
        return await this.authService.getCurrentUser(user);
    }

    @Post('verify-email')
    async verifyEmail(@Body() dto:VerifyEmailDto){
        return await this.authService.verifyEmail(dto);
    }

    @Post('resend-verification')
    async resendVerification(@Body() dto:ResendVerificationDto){
        return await this.authService.resendVerification(dto);
    }

    @Post('forgot-password')
    async forgotPassword(@Body() dto:ForgotPasswordDto){
        return await this.authService.forgotPassword(dto);
    }

    @Post('reset-password')
    async resetPassword(@Body() dto:ResetPasswordDto){
        return await this.authService.resetPassword(dto);
    }

}

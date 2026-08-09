import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUserResponseDto } from './dto/current-user-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { SignupResponseDto } from './dto/signup-response.dto';
import { Throttle } from '@nestjs/throttler';

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
    async signup(@Body() dto: SignUpDto): Promise<SignupResponseDto> {
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

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('me')
    async me(@CurrentUser() user: UserEntity): Promise<CurrentUserResponseDto> {
        return await this.authService.getCurrentUser(user);
    }

}

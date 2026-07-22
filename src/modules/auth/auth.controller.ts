import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
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
import { GoogleAuthGuard } from './guards/google-auth.guard';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    @Post('signup')
    async signup(@Body() dto: SignUpDto): Promise<SignupResponseDto> {
        return await this.authService.signup(dto);
    }

    @Post('login')
    async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
        return await this.authService.login(dto);
    }

    @Get('google')
    @UseGuards(GoogleAuthGuard)
    googleLogin() { }

    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    googleCallback(@Req() req,@Res() res) {

    const result = req.user;


    return res.redirect(
        `http://localhost:5173?token=${result.data.accessToken}`
    );
     }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('me')
    async me(@CurrentUser() user: UserEntity): Promise<CurrentUserResponseDto> {
        return await this.authService.getCurrentUser(user);
    }

}

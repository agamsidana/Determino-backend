import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { UserService } from '../user/user.service';
import { AUTH_MESSAGES } from 'src/shared/constants/messages/auth.messages';
import bcrypt from 'bcrypt';
import { ProfileService } from '../profile/profile.service';
import { JwtService } from '@nestjs/jwt';
import { SignupResponseDto } from './dto/signup-response.dto';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { UserEntity } from '../user/entities/user.entity';
import { CurrentUserResponseDto } from './dto/current-user-response.dto';
import { MailService } from '../mail/mail.service';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { USER_MESSAGES } from 'src/shared/constants/messages/user.messages';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {

    constructor(private readonly userService: UserService, private readonly profileService: ProfileService, private readonly jwtService: JwtService, private readonly dataSource: DataSource, private readonly configService: ConfigService, private readonly mailService: MailService) { }

    async signup(dto: SignUpDto) {

        const { firstName, lastName, email, password } = dto;

        const existingUser = await this.userService.findUserByEmail(email);

        if (existingUser) {
           
            if(!existingUser.isEmailVerified){
                // Generate a new verification code
                const verificationCode = this.generateVerificationCode();
                const verificationCodeExpiresAt = this.getVerificationCodeExpiry();

                existingUser.emailVerificationCode=verificationCode;
                existingUser.emailVerificationCodeExpiresAt=verificationCodeExpiresAt;

                await this.userService.saveUser(existingUser);

                await this.mailService.sendVerificationEmail(
                    'sidanaagam@gmail.com',
                    verificationCode
                );

                return {
                    data:{
                        email:existingUser.email,
                        isEmailVerified:false
                    }
                }

            }

            throw new ConflictException(AUTH_MESSAGES.EMAIL_ALREADY_EXISTS);

        }

        const verificationCode = this.generateVerificationCode();

        const verificationCodeExpiresAt = this.getVerificationCodeExpiry();

        const hashedPassword = await bcrypt.hash(password, Number(this.configService.getOrThrow<number>('HASHING_SALT_ROUNDS')));

        const result = await this.dataSource.transaction(async (manager) => {

            const newUser = await this.userService.createUser({ email, password: hashedPassword, isEmailVerified: false, emailVerificationCode: verificationCode, emailVerificationCodeExpiresAt: verificationCodeExpiresAt }, manager);


            const userProfile = await this.profileService.createProfile({ firstName, lastName, user: newUser }, manager);

            return {
                newUser,
                userProfile
            }

        });

        await this.mailService.sendVerificationEmail(
            "sidanaagam@gmail.com",
            verificationCode,
        );

        return{
            data:{
                email:result.newUser.email,
                isEmailVerified:false
            }
        }

    }

    async login(dto: LoginDto): Promise<LoginResponseDto> {

        const { email, password } = dto;

        const existingUser = await this.userService.findUserByEmailWithCredentials(email);

        if (!existingUser) {
            throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);
        }

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);

        if (!isPasswordCorrect) {
            throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);
        }

        if(!existingUser.isEmailVerified){
            throw new BadRequestException('Please verify your email before logging in');
        }

        const payload: JwtPayload = {
            sub: existingUser.id,
            email: existingUser.email
        }

        const accessToken = await this.jwtService.signAsync(payload);

        return {
            data: {
                accessToken,
                user: {
                    id: existingUser.id,
                    email: existingUser.email
                },

                profile: {
                    firstName: existingUser.profile.firstName,
                    lastName: existingUser.profile.lastName,
                    role: existingUser.profile.role
                }
            }

        }

    }

    async getCurrentUser(user: UserEntity): Promise<CurrentUserResponseDto> {
        return {
            data: {
                id: user.id,
                email: user.email,
                profile: {
                    firstName: user.profile.firstName,
                    lastName: user.profile.lastName,
                    role: user.profile.role,
                    isOnboardingCompleted: user.profile.isOnboardingCompleted,
                    currentOnboardingStep: user.profile.currentOnboardingStep,
                },
            },
        };
    }

    async verifyEmail(dto: VerifyEmailDto) {

        const { email, code } = dto;

        const user = await this.userService.findUserForEmailVerification(email);

        if (!user) {
            throw new NotFoundException(USER_MESSAGES.USER_NOT_FOUND);
        }

        if (user.isEmailVerified) {
            throw new BadRequestException('Email is already verified');
        }

        if (
            !user.emailVerificationCode ||
            !user.emailVerificationCodeExpiresAt
        ) {
            throw new BadRequestException('Verification code not found');
        }

        if (user.emailVerificationCode !== code) {
            throw new BadRequestException('Invalid verification code');
        }

        if (user.emailVerificationCodeExpiresAt < new Date()) {
            throw new BadRequestException('Verification code has expired');
        }

        user.isEmailVerified = true;
        user.emailVerificationCode = null as any;
        user.emailVerificationCodeExpiresAt = null as any;

        await this.userService.saveUser(user);

        //Generate JWT after successfull verification
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email
        }


        const accessToken = await this.jwtService.signAsync(payload);



        return {
            data: {
                accessToken,
                user:{
                    id:user.id,
                    email:user.email
                },
                profile:{
                    firstName:user.profile.firstName,
                    lastName:user.profile.lastName,
                    role:user.profile.role
                }
            },
        };
    }

    async resendVerification(dto: ResendVerificationDto) {

        const { email } = dto;

        const user = await this.userService.findUserByEmail(email);

        if (!user) {
            throw new BadRequestException(USER_MESSAGES.USER_NOT_FOUND);
        }

        if (user.isEmailVerified) {
            throw new BadRequestException('Email is already verified')
        }

        const verificationCode = this.generateVerificationCode();
        const verificationCodeExpiresAt = this.getVerificationCodeExpiry();

        user.emailVerificationCode = verificationCode;
        user.emailVerificationCodeExpiresAt = verificationCodeExpiresAt;

        await this.userService.saveUser(user);

        await this.mailService.sendVerificationEmail(
            "sidanaagam@gmail.com",
            verificationCode,
        );

        return {
            data: {
                message: 'Verification code sent successfully',
            },
        };


    }

    async forgotPassword(dto: ForgotPasswordDto){

        const {email} = dto;

        const user = await this.userService.findUserByEmail(email);

        if(!user){
            throw new NotFoundException(USER_MESSAGES.USER_NOT_FOUND);
        }

        const resetCode = this.generateVerificationCode();
        const resetCodeExpiresAt = this.getVerificationCodeExpiry();

        user.passwordResetCode = resetCode;
        user.passwordResetCodeExpiresAt = resetCodeExpiresAt;

        await this.userService.saveUser(user);

        await this.mailService.sendPasswordResetEmail(
        "sidanaagam@gmail.com",
        resetCode,
        );

        return {
            data: {
                message: 'Password reset code sent successfully',
            },
        };

    }

    async resetPassword(dto: ResetPasswordDto){

        const {email,code,newPassword} = dto;

        const user = await this.userService.findUserForPasswordReset(email);

        if(!user){
            throw new NotFoundException(USER_MESSAGES.USER_NOT_FOUND);
        }

         if (
        !user.passwordResetCode ||
        !user.passwordResetCodeExpiresAt
        ) {
            throw new BadRequestException('Password reset code not found');
        }

        if (user.passwordResetCode !== code) {
            throw new BadRequestException('Invalid password reset code');
        }

        if (user.passwordResetCodeExpiresAt < new Date()) {
            throw new BadRequestException(
            'Password reset code has expired',
            );
        }

        const hashedPassword = await bcrypt.hash(newPassword,Number(this.configService.getOrThrow<number>('HASHING_SALT_ROUNDS')))
        
        user.password = hashedPassword;

        user.passwordResetCode = null as any;
        user.passwordResetCodeExpiresAt = null as any;

        await this.userService.saveUser(user);

        return {
            data: {
                message: 'Password reset successfully',
            },
        };

    }

    private generateVerificationCode(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    private getVerificationCodeExpiry(): Date {
        return new Date(Date.now() + 10 * 60 * 1000);
    }
}

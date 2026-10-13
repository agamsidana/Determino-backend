import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { UserService } from '../user/user.service';
import { AUTH_MESSAGES } from 'src/shared/constants/messages/auth.messages';
import bcrypt from 'bcrypt';
import { ProfileService } from '../profile/profile.service';
import { JwtService } from '@nestjs/jwt';
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
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {

    private readonly googleClient: OAuth2Client;

    constructor(private readonly userService: UserService, private readonly profileService: ProfileService, private readonly jwtService: JwtService, private readonly dataSource: DataSource, private readonly configService: ConfigService, private readonly mailService: MailService) { 
        this.googleClient = new OAuth2Client(
            this.configService.getOrThrow<string>('GOOGLE_CLIENT_ID')
        )
    }

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
                    existingUser.email,
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
            email,
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

        if (!existingUser.password) {
            throw new UnauthorizedException(AUTH_MESSAGES.GOOGLE_ACCOUNT_USE_GOOGLE_SIGNIN);
        }

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);

        if (!isPasswordCorrect) {
            throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);
        }

        if(!existingUser.isEmailVerified){
            throw new BadRequestException(AUTH_MESSAGES.VERIFY_EMAIL_BEFORE_LOGIN);
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

    async loginWithGoogle(idToken: string): Promise<LoginResponseDto> {

        const payload = await this.verifyGoogleToken(idToken);

        const { sub: googleId, email, given_name, family_name } = payload;

        let user = await this.userService.findUserByGoogleIdOrEmail(googleId, email);

        if (user && !user.googleId) {
            user.googleId = googleId;
            user.isEmailVerified = true;
            await this.userService.saveUser(user)
        }

        if (!user) {

            const result = await this.dataSource.transaction(async (manager) => {
                const newUser = await this.userService.createUser({ email, googleId, isEmailVerified: true }, manager);

                await this.profileService.createProfile({
                    firstName: given_name ?? '',
                    lastName: family_name ?? '',
                    user: newUser
                }, manager);

            })

            user = await this.userService.findUserByGoogleIdOrEmail(googleId, email);
        }

        if (!user) {
            throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);
        }

        const jwtPayload: JwtPayload = {
            sub: user.id,
            email: user.email,
        };

        const accessToken = await this.jwtService.signAsync(jwtPayload);

        return {
            data: {
                accessToken,
                user: {
                    id: user.id,
                    email: user.email,
                },
                profile: {
                    firstName: user.profile.firstName,
                    lastName: user.profile.lastName,
                    role: user.profile.role,
                },
            },
        };

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
            throw new BadRequestException(AUTH_MESSAGES.EMAIL_ALREADY_VERIFIED);
        }

        if (
            !user.emailVerificationCode ||
            !user.emailVerificationCodeExpiresAt
        ) {
            throw new BadRequestException(AUTH_MESSAGES.VERIFICATION_CODE_NOT_FOUND);
        }

        if (user.emailVerificationCode !== code) {
            throw new BadRequestException(AUTH_MESSAGES.INVALID_VERIFICATION_CODE);
        }

        if (user.emailVerificationCodeExpiresAt < new Date()) {
            throw new BadRequestException(AUTH_MESSAGES.VERIFICATION_CODE_EXPIRED);
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
            throw new BadRequestException(AUTH_MESSAGES.EMAIL_ALREADY_VERIFIED)
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
                message: AUTH_MESSAGES.VERIFICATION_CODE_SENT,
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
        user.email,
        resetCode,
        );

        return {
            data: {
                message: AUTH_MESSAGES.PASSWORD_RESET_CODE_SENT,
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
            throw new BadRequestException(AUTH_MESSAGES.PASSWORD_RESET_CODE_NOT_FOUND);
        }

        if (user.passwordResetCode !== code) {
            throw new BadRequestException(AUTH_MESSAGES.INVALID_PASSWORD_RESET_CODE);
        }

        if (user.passwordResetCodeExpiresAt < new Date()) {
            throw new BadRequestException(
            AUTH_MESSAGES.PASSWORD_RESET_CODE_EXPIRED,
            );
        }

        const hashedPassword = await bcrypt.hash(newPassword,Number(this.configService.getOrThrow<number>('HASHING_SALT_ROUNDS')))
        
        user.password = hashedPassword;

        user.passwordResetCode = null as any;
        user.passwordResetCodeExpiresAt = null as any;

        await this.userService.saveUser(user);

        return {
            data: {
                message: AUTH_MESSAGES.PASSWORD_RESET_SUCCESSFULL,
            },
        };

    }

    private generateVerificationCode(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    private getVerificationCodeExpiry(): Date {
        return new Date(Date.now() + 10 * 60 * 1000);
    }

    private async verifyGoogleToken(idToken:string){
        let ticket;

        try{
            ticket = await this.googleClient.verifyIdToken({
                idToken,
                audience:this.configService.getOrThrow<string>('GOOGLE_CLIENT_ID')
            });
        }
        catch{
            throw new UnauthorizedException(AUTH_MESSAGES.INVALID_GOOGLE_TOKEN)
        }

        const payload = ticket.getPayload();


        if (!payload) {
            throw new UnauthorizedException(AUTH_MESSAGES.INVALID_GOOGLE_TOKEN);
        }

        if (!payload.email_verified) {
            throw new UnauthorizedException(AUTH_MESSAGES.GOOGLE_EMAIL_NOT_VERIFIED);
        }

        return payload;
    }
}

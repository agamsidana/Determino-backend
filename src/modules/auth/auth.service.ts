import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
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
import { AuthProvider } from 'src/shared/enums/auth-provider.enum';

@Injectable()
export class AuthService {

    constructor(private readonly userService: UserService, private readonly profileService: ProfileService, private readonly jwtService: JwtService, private readonly dataSource: DataSource, private readonly configService: ConfigService) { }

    async signup(dto: SignUpDto): Promise<SignupResponseDto> {

        const { firstName, lastName, email, password } = dto;

        const existingUser = await this.userService.findUserByEmail(email);

        if (existingUser) {
            throw new ConflictException(AUTH_MESSAGES.EMAIL_ALREADY_EXISTS);
        }

        const hashedPassword = await bcrypt.hash(password, Number(this.configService.getOrThrow<number>('HASHING_SALT_ROUNDS')));

        const result = await this.dataSource.transaction(async (manager) => {

            const newUser = await this.userService.createUser({ email, password: hashedPassword, provider: AuthProvider.LOCAL }, manager);


            const userProfile = await this.profileService.createProfile({ firstName, lastName, user: newUser }, manager);

            return {
                newUser,
                userProfile
            }

        })

        const payload: JwtPayload = {
            sub: result.newUser.id,
            email: result.newUser.email
        }

        const accessToken = await this.jwtService.signAsync(payload);

        return {
            data: {
                accessToken,
                user: {
                    id: result.newUser.id,
                    email: result.newUser.email
                },
                profile: {
                    firstName: result.userProfile.firstName,
                    lastName: result.userProfile.lastName,
                    role: result.userProfile.role
                }
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
            throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);
        }


        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);

        if (!isPasswordCorrect) {
            throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);
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

    async validateGoogleUser({
        googleId,
        lastName,
        firstName,
        email
    }): Promise<SignupResponseDto> {

        let user: UserEntity;
        let userProfile;


        const existingUser = await this.userService.findUserByEmailWithProfile(email);


        // New Google user
        if (!existingUser) {

            const result = await this.dataSource.transaction(async (manager) => {

                const newUser = await this.userService.createUser(
                    {
                        email,
                        googleId,
                        provider: AuthProvider.GOOGLE,
                    },
                    manager
                );


                const profile = await this.profileService.createProfile(
                    {
                        firstName,
                        lastName,
                        user: newUser
                    },
                    manager
                );


                return {
                    newUser,
                    profile
                };

            });


            user = result.newUser;
            userProfile = result.profile;

        }


        // Existing local account -> connect Google account
        else if (!existingUser.googleId) {


            const updatedUser = await this.userService.updateUser(
                existingUser.id,
                {
                    googleId,
                    provider: AuthProvider.GOOGLE
                }
            );


            user = updatedUser as UserEntity;
            userProfile = existingUser.profile;

        }


        // Existing Google user
        else {

            user = existingUser;
            userProfile = existingUser.profile;

        }


        const payload: JwtPayload = {
            sub: user.id,
            email: user.email
        };


        const accessToken = await this.jwtService.signAsync(payload);


        return {
            data: {
                accessToken,

                user: {
                    id: user.id,
                    email: user.email
                },

                profile: {
                    firstName: userProfile.firstName,
                    lastName: userProfile.lastName,
                    role: userProfile.role
                }
            }
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
}

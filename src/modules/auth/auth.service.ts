import { ConflictException, Injectable } from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { UserService } from '../user/user.service';
import { AUTH_MESSAGES } from 'src/shared/constants/messages/auth.messages';
import bcrypt from 'bcrypt';
import { ProfileService } from '../profile/profile.service';
import { JwtService } from '@nestjs/jwt';
import { configuration } from 'src/config/configuration';
import { SignupResponseDto } from './dto/signup-response.dto';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {

    constructor(private readonly userService: UserService, private readonly profileService: ProfileService, private readonly jwtService: JwtService, private readonly dataSource: DataSource, private readonly configService:ConfigService) { }

    async signup(dto: SignUpDto): Promise<SignupResponseDto> {

        const { firstName, lastName, email, password } = dto;

        const existingUser = await this.userService.findUserByEmail(email);

        if (existingUser) {
            throw new ConflictException(AUTH_MESSAGES.EMAIL_ALREADY_EXISTS);
        }

        const hashedPassword = await bcrypt.hash(password, this.configService.getOrThrow<number>('HASHING_SALT_ROUNDS'));

        const result = await this.dataSource.transaction(async (manager) => {

            const newUser = await this.userService.createUser({ email, password: hashedPassword }, manager);


            const userProfile = await this.profileService.createProfile({ firstName, lastName, user: newUser }, manager);

            return {
                newUser,
                userProfile
            }

        })

        const payload:JwtPayload = {
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

}

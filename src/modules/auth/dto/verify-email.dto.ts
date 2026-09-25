import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Matches } from 'class-validator';

export class VerifyEmailDto {

    @ApiProperty()
    @IsEmail()
    email!: string;

    @ApiProperty()
    @Matches(/^\d{6}$/, {
        message: 'Verification code must be 6 digits',
    })
    code!: string;
}
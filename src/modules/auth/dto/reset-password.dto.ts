import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {

    @ApiProperty()
    @IsEmail()
    email!: string;

    @ApiProperty()
    @Matches(/^\d{6}$/, {
        message: 'Reset code must be 6 digits',
    })
    code!: string;

    @ApiProperty()
    @IsString()
    @MinLength(8)
    newPassword!: string;
}
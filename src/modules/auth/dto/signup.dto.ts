import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsString, MinLength } from "class-validator";

export class SignUpDto {

    @ApiProperty()
    @IsString()
    @Transform(({ value }) => value?.trim())
    firstName!: string;

    @ApiProperty()
    @IsString()
    @Transform(({ value }) => value?.trim())
    lastName!: string;

    @ApiProperty()
    @IsEmail()
    @Transform(({ value }) => value?.trim().toLowerCase())
    email!: string;

    @ApiProperty()
    @MinLength(8)
    @IsString()
    password!: string;

}
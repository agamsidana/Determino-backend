import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsString } from "class-validator";

export class LoginDto {

    @ApiProperty()
    @IsEmail()
    @Transform(({ value }) => value?.trim().toLowerCase())
    email!: string;

    @ApiProperty()
    @IsString()
    password!: string

}
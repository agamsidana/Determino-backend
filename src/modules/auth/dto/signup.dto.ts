import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class SignUpDto{

    @ApiProperty()
    @IsString()
    firstName!:string;

    @ApiProperty()
    @IsString()
    lastName!:string;

    @ApiProperty()
    @IsEmail()
    email!:string;

    @ApiProperty()
    @MinLength(8)
    @IsString()
    password!:string;

}
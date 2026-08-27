import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateGroupDto{

    @ApiProperty()
    @IsString()
    @MinLength(3)
    @MaxLength(100)
    name!:string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    @MaxLength(500)
    description!:string;



}
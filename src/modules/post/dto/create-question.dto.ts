import { ApiProperty } from "@nestjs/swagger";
import { ArrayMaxSize, IsArray, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateQuestionDto{

    @ApiProperty()
    @IsString()
    @MinLength(10)
    @MaxLength(200)
    title!:string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    @MaxLength(3000)
    content!:string;

    @ApiProperty()
    @IsOptional()
    @ArrayMaxSize(10)
    @IsArray()
    @IsString({ each: true })
    @MaxLength(50, { each: true })
    hashtags?: string[];
}
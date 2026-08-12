import { ApiProperty } from "@nestjs/swagger";
import { ArrayMaxSize, IsArray, IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { PostType } from "../enums/post-type.enum";

export class CreatePostDto{

    @ApiProperty()
    @IsString()
    title!:string;

    @ApiProperty()
    @IsString()
    content!:string;

    @ApiProperty()
    @IsEnum(PostType)
    type!:PostType;

    @IsOptional()
    @ArrayMaxSize(10)
    @IsArray()
    @IsString({each:true})
    @MaxLength(50,{each:true})
    hashTags!:string[]

}
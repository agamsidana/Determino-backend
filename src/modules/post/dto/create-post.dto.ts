import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString } from "class-validator";
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

}
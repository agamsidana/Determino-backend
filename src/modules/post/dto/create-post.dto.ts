import { ApiProperty } from "@nestjs/swagger";
import { ArrayMaxSize, IsArray, IsEnum, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator";
import { PostType } from "../enums/post-type.enum";
import { CreatePostAttachmentDto } from "./create-post-attachment.dto";
import { Type } from "class-transformer";
import { PollInputDto } from "./poll-input.dto";

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

    @ApiProperty()
    @IsOptional()
    @ArrayMaxSize(10)
    @IsArray()
    @IsString({each:true})
    @MaxLength(50,{each:true})
    hashtags!:string[];

    @ApiProperty({
        type:[CreatePostAttachmentDto],
        required:false
    })
    @IsOptional()
    @IsArray()
    @ArrayMaxSize(5)
    @ValidateNested({each:true})
    @Type(()=>CreatePostAttachmentDto)
    attachments!:CreatePostAttachmentDto[];

    @ApiProperty({
        type:PollInputDto,
        required:false
    })
    @IsOptional()
    @ValidateNested()
    @Type(()=>PollInputDto)
    poll!:PollInputDto

}
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUrl, IsUUID } from 'class-validator';
import { PostAttachmentType } from '../enums/post-attachment-type.enum';
export class CreatePostAttachmentDto {

    @ApiProperty({
        enum:PostAttachmentType
    })
    @IsEnum(PostAttachmentType)
    type!:PostAttachmentType;

    @ApiPropertyOptional({
        example: 'a4736ba0-adfa-41bc-a548-a3f634af800f',
    })
    @IsOptional()
    @IsUUID()
    uploadId!: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUrl()
    url!:string
    
}
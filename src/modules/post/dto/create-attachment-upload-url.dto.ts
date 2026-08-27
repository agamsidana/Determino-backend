import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PostAttachmentType } from '../enums/post-attachment-type.enum';
import { UploadMimeType } from '../enums/upload-mime-type.enum';

export class CreateAttachmentUploadUrlDto {

  @ApiProperty({
    example: 'study-plan.pdf',
  })
  @IsString()
  @MaxLength(255)
  fileName!: string;

  @ApiProperty({
    example: 'application/pdf',
  })
  @IsEnum(UploadMimeType)
  mimeType!: UploadMimeType;

  @ApiProperty({
    example: 245678,
  })
  @IsInt()
  @Min(1)
  @Max(10 * 1024 * 1024)
  fileSize!: number;

  @ApiProperty({
    enum: [
      PostAttachmentType.IMAGE,
      PostAttachmentType.DOCUMENT,
    ],
    example: PostAttachmentType.DOCUMENT,
  })
  @IsEnum(PostAttachmentType)
  type!: PostAttachmentType;
}
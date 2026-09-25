import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsString, Max, Min } from 'class-validator';
import { UploadMimeType } from 'src/shared/enums/upload-mime-type.enum';


export class CreateAvatarUploadDto {

    @ApiProperty({
        enum: UploadMimeType,
        example: UploadMimeType.JPEG,
    })
    @IsEnum(UploadMimeType)
    mimeType!: UploadMimeType;

    @ApiProperty({
        example: 'profile.jpg',
    })
    @IsString()
    fileName!: string;

    @ApiProperty({
        example: 245678,
    })
    @IsInt()
    @Min(1)
    @Max(5 * 1024 * 1024)
    fileSize!: number;
}
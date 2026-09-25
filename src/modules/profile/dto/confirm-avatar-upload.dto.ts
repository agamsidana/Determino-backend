import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ConfirmAvatarUploadDto {

    @ApiProperty({
        example: '9f8c4b6e-2f3d-4c7a-9b1e-123456789abc',
    })
    @IsUUID()
    uploadId!: string;
}
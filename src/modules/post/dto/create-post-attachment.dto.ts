import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
export class CreatePostAttachmentDto {

    @ApiProperty({
        example: 'a4736ba0-adfa-41bc-a548-a3f634af800f',
    })
    @IsUUID()
    uploadId!: string;
    
}
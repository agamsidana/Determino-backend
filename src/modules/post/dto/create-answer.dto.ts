import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateAnswerDto {

    @ApiProperty()
    @IsString()
    @MinLength(1)
    @MaxLength(5000)
    content!: string;

}
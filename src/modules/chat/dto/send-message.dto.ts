import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength, MinLength } from "class-validator";

export class SendMessageDto{

    @ApiProperty()
    @MaxLength(2000)
    @MinLength(1)
    @IsString()
    content!:string;

}
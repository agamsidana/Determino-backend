import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsString, IsUUID, ValidateNested } from "class-validator";

export class SubmitQuizAnswerDto{

    @ApiProperty()
    @IsUUID()
    questionId!:string;

    @IsString()
    @IsNotEmpty()
    selectedOption!:string;

}

export class SubmitQuizDto{

    @ApiProperty()
    @IsArray()
    @ValidateNested({each:true})
    @Type(()=>SubmitQuizAnswerDto)
    answers!:SubmitQuizAnswerDto[];

}
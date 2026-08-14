import { ArrayMinSize, IsArray, IsString, MaxLength } from "class-validator";

export class PollInputDto{

    @IsArray()
    @ArrayMinSize(2)
    @IsString({each:true})
    @MaxLength(50,{each:true})
    options!:string[];

}
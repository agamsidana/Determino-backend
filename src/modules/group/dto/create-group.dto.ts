import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { GroupColor } from "../enums/group-color.enum";

export class CreateGroupDto {

    @ApiProperty()
    @IsString()
    @MinLength(3)
    @MaxLength(100)
    name!: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    @MaxLength(500)
    description!: string;

    @ApiProperty()
    @IsEnum(GroupColor)
    color!: GroupColor;



}
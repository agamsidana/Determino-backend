import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateGroupDto {

    @ApiProperty()
    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(100)
    name!: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description!: string;

}
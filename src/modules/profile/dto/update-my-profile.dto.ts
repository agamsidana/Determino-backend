import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateMyProfileDto{

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    firstName?:string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    lastName?:string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    bio?:string;
}
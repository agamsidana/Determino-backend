import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import { Role } from "src/shared/enums/role.enum";

export class DiscoverQueryDto{

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page:number = 1;
    
    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit:number = 20;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    examId?:string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?:string

    @ApiPropertyOptional()
    @Type(()=>Boolean)
    @IsBoolean()
    onlineOnly?:boolean = false;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEnum(Role)
    sort?:Role;

}
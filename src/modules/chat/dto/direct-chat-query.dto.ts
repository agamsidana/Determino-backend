import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsISO8601, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";

export class DirectChatQueryDto {

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit: number = 10;

    @ApiPropertyOptional()
    @IsOptional()
    @IsISO8601()
    lastActivityAt?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    conversationId?: string;
}
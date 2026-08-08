import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AnalyticsQueryDto {

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(2000)
    year?: number;

}
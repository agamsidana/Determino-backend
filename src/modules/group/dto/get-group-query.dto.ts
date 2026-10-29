import { IsEnum, IsOptional, IsString } from "class-validator";
import { GroupFilter } from "../enums/group-filter.enum";
import { PaginationQueryDto } from "src/shared/dto/pagination-query.dto";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class GetGroupQueryDto extends PaginationQueryDto {

    @ApiProperty({
        enum: GroupFilter,
        description: 'Filter groups by user membership',
        example: GroupFilter.MY_GROUPS,
    })
    @IsEnum(GroupFilter)
    filter!: GroupFilter;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?:string;

}
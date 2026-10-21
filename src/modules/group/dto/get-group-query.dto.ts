import { IsEnum, IsOptional } from "class-validator";
import { GroupFilter } from "../enums/group-filter.enum";
import { PaginationQueryDto } from "src/shared/dto/pagination-query.dto";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class GetGroupQueryDto extends PaginationQueryDto {

    @ApiPropertyOptional({
        enum: GroupFilter,
        description: 'Filter groups by user membership',
        example: GroupFilter.MY_GROUPS,
    })
    @IsOptional()
    @IsEnum(GroupFilter)
    filter?: GroupFilter;

}
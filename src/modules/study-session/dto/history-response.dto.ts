import { ApiProperty } from '@nestjs/swagger';
import { StudySession } from '../enums/study-session-status.enum';

export class HistorySessionDto {

    @ApiProperty()
    id!: string;

    @ApiProperty()
    startedAt!: Date;

    @ApiProperty()
    endedAt!: Date;

    @ApiProperty()
    plannedDurationMinutes!: number;

    @ApiProperty()
    actualFocusMinutes!: number;

    @ApiProperty()
    status!: StudySession;

}

class PaginationDto {

    @ApiProperty()
    page!: number;

    @ApiProperty()
    limit!: number;

    @ApiProperty()
    total!: number;

    @ApiProperty()
    totalPages!: number;

}

export class HistoryResponseDto {

    @ApiProperty({
        type:HistorySessionDto,
        isArray:true
    })
    data!: HistorySessionDto[];

    @ApiProperty({
        type:PaginationDto
    })
    pagination!: PaginationDto;

}
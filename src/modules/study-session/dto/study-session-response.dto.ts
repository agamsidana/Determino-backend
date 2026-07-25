import { ApiProperty } from '@nestjs/swagger';
import { StudySession } from '../enums/study-session-status.enum';

class StudySessionStartDataDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: StudySession })
  status!: StudySession;

  @ApiProperty()
  startedAt!: Date;

  @ApiProperty()
  plannedDurationMinutes!: number;
}

class StudySessionCurrentDataDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: StudySession })
  status!: StudySession;

  @ApiProperty()
  startedAt!: Date;

  @ApiProperty({ nullable: true })
  pausedAt!: Date | null;

  @ApiProperty()
  totalPausedSeconds!: number;

  @ApiProperty()
  plannedDurationMinutes!: number;
}

class StudySessionStatusDataDto {
  @ApiProperty({ enum: StudySession })
  status!: StudySession;
}

export class StartStudySessionResponseDto {
  @ApiProperty({
    type: StudySessionStartDataDto,
  })
  data!: StudySessionStartDataDto;
}

export class CurrentStudySessionResponseDto {
  @ApiProperty({
    type: StudySessionCurrentDataDto,
    nullable: true,
  })
  data!: StudySessionCurrentDataDto | null;
}

export class StudySessionStatusResponseDto {
  @ApiProperty({
    type: StudySessionStatusDataDto,
  })
  data!: StudySessionStatusDataDto;
}

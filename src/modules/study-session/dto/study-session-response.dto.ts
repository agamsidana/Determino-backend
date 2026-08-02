import { ApiProperty } from '@nestjs/swagger';
import { StudySession } from '../enums/study-session-status.enum';

export class StudySessionDto {

  @ApiProperty()
  id!: string;

  @ApiProperty({
    enum: StudySession
  })
  status!: StudySession;

  @ApiProperty()
  startedAt!: Date;

  @ApiProperty({
    nullable: true
  })
  pausedAt!: Date | null;

  @ApiProperty()
  totalPausedSeconds!: number;

  @ApiProperty()
  plannedDurationMinutes!: number;

}

export class StudySessionResponseDto {

  @ApiProperty({
    type: StudySessionDto,
    nullable: true
  })
  data!: StudySessionDto | null;

}
class StudySessionStatusDto {
  @ApiProperty({ enum: StudySession })
  status!: StudySession;
}

export class StudySessionStatusResponseDto {
  @ApiProperty({
    type: StudySessionStatusDto,
  })
  data!: StudySessionStatusDto;
}

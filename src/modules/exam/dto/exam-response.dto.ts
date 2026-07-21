import { ApiProperty } from '@nestjs/swagger';

class ExamDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  icon!: string;

  @ApiProperty()
  iconColor!: string;

  @ApiProperty()
  isPopular!: boolean;

  @ApiProperty()
  isActive!: boolean;
}

export class ExamResponseDto {
  @ApiProperty({
    type: [ExamDto],
  })
  data!: ExamDto[];
}

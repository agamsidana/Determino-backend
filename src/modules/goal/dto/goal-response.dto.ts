import { ApiProperty } from '@nestjs/swagger';

class GoalDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  icon!: string;

  @ApiProperty()
  iconColor!: string;

  @ApiProperty()
  isActive!: boolean;
}

export class GoalResponseDto {
  @ApiProperty({
    type: [GoalDto],
  })
  data!: GoalDto[];
}

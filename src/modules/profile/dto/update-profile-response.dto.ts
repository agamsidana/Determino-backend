import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/shared/enums/role.enum';

class UpdateProfileExamDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;
}

class UpdateProfileGoalDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;
}

class UpdateProfileDataProfileDto {
  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty({
    nullable: true,
  })
  avatar!: string | null;

  @ApiProperty({
    enum: Role,
    nullable: true,
    example: Role.ASPIRANT,
  })
  role!: Role | null;

  @ApiProperty()
  currentOnboardingStep!: number;

  @ApiProperty()
  isOnboardingCompleted!: boolean;

  @ApiProperty({
    type: UpdateProfileExamDto,
    nullable: true,
  })
  exam!: UpdateProfileExamDto | null;

  @ApiProperty({
    type: [UpdateProfileGoalDto],
    nullable: true,
  })
  goals!: UpdateProfileGoalDto[] | null;
}

class UpdateProfileDataDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({
    type: UpdateProfileDataProfileDto,
  })
  profile!: UpdateProfileDataProfileDto;
}

export class UpdateProfileResponseDto {
  @ApiProperty({
    type: UpdateProfileDataDto,
  })
  data!: UpdateProfileDataDto;
}

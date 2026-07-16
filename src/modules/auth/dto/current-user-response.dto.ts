import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/shared/enums/role.enum';

class CurrentUserProfileDto {
  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty({ enum: Role })
  role!: Role;

  @ApiProperty()
  isOnboardingCompleted!: boolean;

  @ApiProperty()
  currentOnboardingStep!: number;
}

class CurrentUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({
    type: CurrentUserProfileDto,
  })
  profile!: CurrentUserProfileDto;
}

export class CurrentUserResponseDto {
  @ApiProperty({
    type: CurrentUserDto,
  })
  data!: CurrentUserDto;
}
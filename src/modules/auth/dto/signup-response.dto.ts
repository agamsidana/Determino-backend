import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/shared/enums/role.enum';

class SignupUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;
}

class SignupProfileDto {
  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty({
    enum: Role,
    example: Role.ASPIRANT,
  })
  role!: Role;
}

class SignupDataDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty({
    type: SignupUserDto,
  })
  user!: SignupUserDto;

  @ApiProperty({
    type: SignupProfileDto,
  })
  profile!: SignupProfileDto;
}

export class SignupResponseDto {
  @ApiProperty({
    type: SignupDataDto,
  })
  data!: SignupDataDto;
}
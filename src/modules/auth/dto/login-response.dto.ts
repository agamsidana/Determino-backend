import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/shared/enums/role.enum';

class LoginUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;
}

class LoginProfileDto {
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

class LoginDataDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty({
    type: LoginUserDto,
  })
  user!: LoginUserDto;

  @ApiProperty({
    type: LoginProfileDto,
  })
  profile!: LoginProfileDto;
}

export class LoginResponseDto {
  @ApiProperty({
    type: LoginDataDto,
  })
  data!: LoginDataDto;
}
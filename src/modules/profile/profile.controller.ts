import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateProfileResponseDto } from './dto/update-profile-response.dto';


@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {

    constructor(private readonly profileService: ProfileService) { }

    @Patch()
    async updateProfile(@CurrentUser() user: UserEntity, @Body() dto: UpdateProfileDto): Promise<UpdateProfileResponseDto> {
        return await this.profileService.updateProfile(user, dto)
    }

}

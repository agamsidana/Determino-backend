import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateProfileResponseDto } from './dto/update-profile-response.dto';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';


@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {

    constructor(private readonly profileService: ProfileService) { }

    @Get('me')
    async getMyProfile(@CurrentUser() user:UserEntity){
        return await this.profileService.getMyProfile(user.id);
    }

    @Patch('me')
    async updateMyProfile(@CurrentUser() user:UserEntity,@Body() dto:UpdateMyProfileDto){
        return await this.profileService.updateMyProfile(user.id,dto);
    }

    @Patch()
    async updateProfile(@CurrentUser() user: UserEntity, @Body() dto: UpdateProfileDto): Promise<UpdateProfileResponseDto> {
        return await this.profileService.updateProfile(user, dto)
    }

}

import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateProfileResponseDto } from './dto/update-profile-response.dto';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';
import { CreateAvatarUploadDto } from './dto/create-avatar-upload.dto';
import { ConfirmAvatarUploadDto } from './dto/confirm-avatar-upload.dto';
import { PaginationQueryDto } from 'src/shared/dto/pagination-query.dto';


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

    @Get(':userId')
    async getPublicProfile(@Param('userId') userId:string,@CurrentUser() user:UserEntity){
        return await this.profileService.getPublicProfile(user.id,userId);
    }

    @Get('me/post')
    async getMyPosts(@CurrentUser() user:UserEntity,@Query() query:PaginationQueryDto){
        return await this.profileService.getMyPosts(user.id, query);
    }

    @Get('me/saved-post')
    async getMySavedPosts(@CurrentUser() user:UserEntity,@Query() query:PaginationQueryDto){
        return this.profileService.getMySavedPosts(user.id,query);
    }

    @Get('me/question')
    async getMyQuestions(@CurrentUser() user:UserEntity,@Query() query:PaginationQueryDto){
        return await this.profileService.getMyQuestions(user.id,query);
    }

    @Get('me/saved-question')
    async getMySavedQuestions(@CurrentUser() user:UserEntity,@Query() query:PaginationQueryDto){
        return await this.profileService.getMySavedQuestions(user.id,query);
    }

    @Get(':userId/post')
    async getPostsByUser(@Param('userId') profileUserId:string,@CurrentUser() viewer:UserEntity,@Query() query: PaginationQueryDto){
        return await this.profileService.getPostsByUser(profileUserId,viewer.id,query);
    }

    @Get(':userId/question')
    async getQuestionsByUser(@Param('userId') profileUserId:string,@CurrentUser() viewer:UserEntity,@Query() query:PaginationQueryDto){
        return await this.profileService.getQuestionsByUser(profileUserId,viewer.id,query);
    }

    @Patch()
    async updateProfile(@CurrentUser() user: UserEntity, @Body() dto: UpdateProfileDto): Promise<UpdateProfileResponseDto> {
        return await this.profileService.updateProfile(user, dto)
    }

    @Post('avatar/upload')
    async createAvatarUpload(@CurrentUser() user:UserEntity,@Body() dto:CreateAvatarUploadDto){
        return await this.profileService.createAvatarUpload(user.id,dto);
    }

    @Post('avatar/confirm')
    async confirmAvatarUpload(@CurrentUser() user: UserEntity,@Body() dto: ConfirmAvatarUploadDto) {
        return await this.profileService.confirmAvatarUpload(user.id,dto);
    }

}

import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class AnalyticsController {

    constructor(private readonly analyticsService:AnalyticsService){}

    @Get('/dashboard')
    async getDashboard(@CurrentUser() user:UserEntity){
        return await this.analyticsService.getDashboard(user.id);
    }



}

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';

@Controller('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class AnalyticsController {

    constructor(private readonly analyticsService:AnalyticsService){}

    @Get('/dashboard')
    @ApiQuery({
        name:'year',
        required:false
    })
    async getDashboard(@CurrentUser() user:UserEntity, @Query() query:AnalyticsQueryDto){
        return await this.analyticsService.getDashboard(user.id,query.year);
    }



}

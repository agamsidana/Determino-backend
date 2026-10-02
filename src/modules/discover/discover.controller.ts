import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DiscoverService } from './discover.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { DiscoverQueryDto } from './dto/discover-query.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('discover')
export class DiscoverController {

    constructor(private readonly discoverService:DiscoverService){}

    @Get()
    getDiscover(@CurrentUser() user:UserEntity,@Query() query:DiscoverQueryDto){
        return this.discoverService.getDiscover(user.id,query);
    }





}

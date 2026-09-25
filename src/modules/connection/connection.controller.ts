import { Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ConnectionService } from './connection.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { PaginationQueryDto } from 'src/shared/dto/pagination-query.dto';


@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('connection')
export class ConnectionController {

    constructor(private readonly connectionService:ConnectionService){}

    @Post('request/:receiverId')
    async sendPrepMateRequest(@Param('receiverId') receiverId:string,@CurrentUser() user:UserEntity){
        return await this.connectionService.sendPrepMateRequest(receiverId,user.id);
    }

    @Patch('request/:connectionId/accept')
    async acceptPrepMateRequest(@Param('connectionId') connectionId:string,@CurrentUser() user:UserEntity){
        return await this.connectionService.acceptPrepMateRequest(connectionId,user.id);
    }

    @Patch('request/:connectionId/decline')
    async declinePrepMateRequest(@Param('connectionId') connectionId:string,@CurrentUser() user:UserEntity){
        return await this.connectionService.declinePrepMateRequest(connectionId,user.id);
    }

    @Get('request/pending')
    async getPendingPrepMateRequests(@CurrentUser() user:UserEntity,@Query() query:PaginationQueryDto){
        return await this.connectionService.getPendingPrepMateRequests(user.id,query);
    }

    @Get('prepmates')
    async getMyPrepMates(@CurrentUser() user:UserEntity,@Query() query:PaginationQueryDto){
        return await this.connectionService.getMyPrepMates(user.id,query);
    }

}

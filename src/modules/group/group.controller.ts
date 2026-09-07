import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { GroupService } from './group.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { PaginationQueryDto } from 'src/shared/dto/pagination-query.dto';

@Controller('group')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class GroupController {

    constructor(private readonly groupService:GroupService){}

    @Post()
    async createGroup(@CurrentUser() user:UserEntity,@Body() dto:CreateGroupDto){
        return await this.groupService.createGroup(user,dto)
    }

    @Get()
    async getGroups(@CurrentUser() user:UserEntity,@Query() query:PaginationQueryDto){
        return await this.groupService.getGroups(user.id,query);
    }

    @Post(':groupId/join')
    async joinGroup(@CurrentUser() user:UserEntity,@Param('groupId') groupId:string){
        return await this.groupService.joinGroup(user.id,groupId)
    }

    @Delete(':groupId/join')
    async leaveGroup(@CurrentUser() user:UserEntity,@Param('groupId') groupId:string){
        return await this.groupService.leaveGroup(user.id,groupId);
    }

    @Post(':groupId/members/:targetUserId/promote')
    async promoteMember(@Param('groupId') groupId:string,@Param('targetUserId') targetUserId:string,@CurrentUser() user:UserEntity){
        return await this.groupService.promoteMember(groupId,targetUserId,user.id);

    }

}

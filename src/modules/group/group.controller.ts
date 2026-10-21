import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { GroupService } from './group.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { PaginationQueryDto } from 'src/shared/dto/pagination-query.dto';
import { MessageGateway } from '../chat/gateway/message.gateway';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GetGroupQueryDto } from './dto/get-group-query.dto';

@Controller('group')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class GroupController {

    constructor(private readonly groupService:GroupService,  private readonly messageGateway: MessageGateway,){}

    @Post()
    async createGroup(@CurrentUser() user:UserEntity,@Body() dto:CreateGroupDto){
        return await this.groupService.createGroup(user,dto)
    }

    @Get()
    async getGroups(@CurrentUser() user:UserEntity,@Query() query:GetGroupQueryDto){
        return await this.groupService.getGroups(user.id,query);
    }

    @Get('trending')
    async getTrendingGroups(@CurrentUser() user:UserEntity,@Query('limit') limit?:string){
        return await this.groupService.getTrendingGroups(limit ? Number(limit) : undefined,user.id);
    }

    @Get(':groupId')
    async getGroupById(@CurrentUser() user:UserEntity,@Param('groupId') groupId:string){
        return await this.groupService.getGroupById(user.id,groupId);

    }

    @Get(':groupId/presence')
    async getGroupPresence(@Param('groupId') groupId:string,@CurrentUser() user:UserEntity){
        return await this.groupService.getGroupPresence(groupId,user.id);
    }

    @Patch(':groupId')
    async updateGroup(@Param('groupId') groupId:string,@Body() dto:UpdateGroupDto, @CurrentUser() user:UserEntity){
        return await this.groupService.updateGroup(groupId,user.id,dto);

    }

    @Get(':groupId/members')
    async getGroupMembers(@Param('groupId') groupId:string,@CurrentUser() user:UserEntity,@Query() query:PaginationQueryDto){
        return await this.groupService.getGroupMembers(groupId,user.id,query)
    }

    @Post(':groupId/join')
    async joinGroup(@CurrentUser() user:UserEntity,@Param('groupId') groupId:string){
        const result =  await this.groupService.joinGroup(user,groupId);
        this.messageGateway.emitNewMessage(result.data.conversationId,result.data.systemMessage)
        return result;
    }

    @Delete(':groupId/join')
    async leaveGroup(@CurrentUser() user:UserEntity,@Param('groupId') groupId:string){
        const result = await this.groupService.leaveGroup(user,groupId);
        this.messageGateway.emitNewMessage(result.data.conversationId,result.data.systemMessage);
        return result;
    }

    @Post(':groupId/members/:targetUserId/promote')
    async promoteMember(@Param('groupId') groupId:string,@Param('targetUserId') targetUserId:string,@CurrentUser() user:UserEntity){
        return await this.groupService.promoteMember(groupId,targetUserId,user.id);

    }

}

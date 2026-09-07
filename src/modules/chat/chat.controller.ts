import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ChatController {

    constructor(private readonly chatService:ChatService){}

    @Post(':conversationId/message')
    async sendMessage(@Param('conversationId') conversationId:string,@CurrentUser() user:UserEntity,@Body() dto:SendMessageDto){
        return await this.chatService.sendMessage(conversationId,user,dto)
    }

    @Get(':conversationId/message')
    async getMessage(@Param('conversationId') conversationId:string,@CurrentUser() user:UserEntity, @Query('limit', new DefaultValuePipe(30), new ParseIntPipe()) limit: number,@Query('before') before?:string){
        return await this.chatService.getMessages(conversationId,user,before,limit);
    }

    @Delete(':conversationId/:messageId/message')
    async deleteMessage(@Param('conversationId') conversationId:string,@Param('messageId') messageId:string,@CurrentUser() user:UserEntity){
        return await this.chatService.deleteMessage(conversationId,messageId,user.id)
    }

}

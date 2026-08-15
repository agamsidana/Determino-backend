import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/shared/dto/pagination-query.dto';
import { PostReactionService } from './post-reaction.service';
import { CreateAttachmentUploadUrlDto } from './dto/create-attachment-upload-url.dto';
import { PostAttachmentService } from './post-attachment.service';
import { VotePollDto } from './dto/vote-poll.dto';
import { PostPollService } from './post-poll.service';

@Controller('post')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class PostController {

    constructor(private readonly postService: PostService, private readonly postReactionService:PostReactionService, private readonly postAttachmentService:PostAttachmentService,private readonly postPollService:PostPollService ) { }

    @Post()
    async createPost(@CurrentUser() user: UserEntity, @Body() dto:CreatePostDto) {
        return await this.postService.createPost(user.id,dto)
    }

    @Post("attachments/upload-url")
    async getUploadUrl(@CurrentUser() user:UserEntity,@Body() dto:CreateAttachmentUploadUrlDto){
        return await this.postAttachmentService.createUploadUrl(user.id,dto);
    }

    @Get()
    async getPosts(@Query() query:PaginationQueryDto, @CurrentUser() user:UserEntity){
        return await this.postService.getPosts(query,user.id);
    }

    @Post(':postId/poll/vote')
    async voteOnPoll(@Param('postId') postId:string,@CurrentUser() user:UserEntity,@Body() dto:VotePollDto){
        await this.postPollService.voteOnPoll(postId,user.id,dto);
    }

    @Post(':postId/helpful')
    async addHelpful(@Param('postId') postId:string,@CurrentUser() user:UserEntity){
        return await this.postReactionService.addHelpful(postId,user.id)
    }

    @Delete(':postId/helpful')
    async removeHelpful(@Param('postId') postId:string,@CurrentUser() user:UserEntity){
        return await this.postReactionService.removeHelpful(postId,user.id)
    }

}

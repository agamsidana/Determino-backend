import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/shared/dto/pagination-query.dto';
import { PostReactionService } from './post-reaction.service';
import { CreateAttachmentUploadUrlDto } from './dto/create-attachment-upload-url.dto';
import { PostAttachmentService } from './post-attachment.service';
import { VotePollDto } from './dto/vote-poll.dto';
import { PostPollService } from './post-poll.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PostCommentService } from './post-comment.service';
import { PostSaveService } from './post-save.service';

@Controller('post')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class PostController {

    constructor(private readonly postService: PostService, private readonly postReactionService: PostReactionService, private readonly postAttachmentService: PostAttachmentService, private readonly postPollService: PostPollService, private readonly postCommentService: PostCommentService, private readonly postSaveService: PostSaveService) { }

    @Post()
    async createPost(@CurrentUser() user: UserEntity, @Body() dto: CreatePostDto) {
        return await this.postService.createPost(user, dto)
    }

    @Post("attachments/upload-url")
    async getUploadUrl(@CurrentUser() user: UserEntity, @Body() dto: CreateAttachmentUploadUrlDto) {
        return await this.postAttachmentService.createUploadUrl(user.id, dto);
    }

    @Get()
    async getPosts(@Query() query: PaginationQueryDto, @CurrentUser() user: UserEntity) {
        return await this.postService.getPosts(query, user.id);
    }

    @Get('hashtags/suggest')
    @ApiQuery({
        name: 'q',
        required: false,
        type: String,
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        example: 3,
    })
    async suggestHashtags(@Query('q') q: string | undefined, @Query('limit', new DefaultValuePipe(3), new ParseIntPipe()) limit: number) {
        return await this.postService.suggestHashtags(q, limit);
    }

    @Post(':postId/comment')
    async createComment(@Param('postId') postId: string, @CurrentUser() user: UserEntity, @Body() dto: CreateCommentDto) {
        return await this.postCommentService.createComment(postId, user, dto);
    }

    @Get(':postId/comment')
    async getComments(@Param('postId') postId: string, @Query() query: PaginationQueryDto) {
        return await this.postCommentService.getComments(postId, query);

    }

    @Post(':postId/poll/vote')
    async voteOnPoll(@Param('postId') postId: string, @CurrentUser() user: UserEntity, @Body() dto: VotePollDto) {
        return await this.postPollService.voteOnPoll(postId, user.id, dto);
    }

    @Post(':postId/save')
    async savePost(@Param('postId') postId: string, @CurrentUser() user: UserEntity) {
        return this.postSaveService.savePost(postId, user.id);
    }

    @Delete(':postId/save')
    async unsavePost(@Param('postId') postId: string, @CurrentUser() user: UserEntity) {
        return this.postSaveService.unsavePost(postId, user.id);
    }

    @Post(':postId/helpful')
    async addHelpful(@Param('postId') postId: string, @CurrentUser() user: UserEntity) {
        return await this.postReactionService.addHelpful(postId, user.id)
    }

    @Delete(':postId/helpful')
    async removeHelpful(@Param('postId') postId: string, @CurrentUser() user: UserEntity) {
        return await this.postReactionService.removeHelpful(postId, user.id)
    }

}

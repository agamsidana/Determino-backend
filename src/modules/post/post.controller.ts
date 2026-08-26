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
import { CreateAnswerDto } from './dto/create-answer.dto';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';

@Controller('post')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class PostController {

    constructor(private readonly postService: PostService, private readonly postReactionService: PostReactionService, private readonly postAttachmentService: PostAttachmentService, private readonly postPollService: PostPollService, private readonly postCommentService: PostCommentService, private readonly postSaveService: PostSaveService, private readonly questionService:QuestionService) { }

    @Post()
    async createPost(@CurrentUser() user: UserEntity, @Body() dto: CreatePostDto) {
        return await this.postService.createPost(user, dto)
    }

    @Post('question')
    async createQuestion(@CurrentUser() user:UserEntity,@Body() dto:CreateQuestionDto){
        return await this.questionService.createQuestion(user,dto);
    }

    @Post("attachments/upload-url")
    async getUploadUrl(@CurrentUser() user: UserEntity, @Body() dto: CreateAttachmentUploadUrlDto) {
        return await this.postAttachmentService.createUploadUrl(user.id, dto);
    }

    @Get()
    async getPosts(@Query() query: PaginationQueryDto, @CurrentUser() user: UserEntity) {
        return await this.postService.getPosts(query, user.id);
    }

    @Get('question')
    async getQuestions(@Query() query:PaginationQueryDto,@CurrentUser() user:UserEntity){
        return await this.questionService.getQuestions(query,user.id);
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
    async getComments(@Param('postId') postId: string, @CurrentUser() user:UserEntity,@Query() query: PaginationQueryDto) {
        return await this.postCommentService.getComments(postId,user.id,query);

    }

    @Post('question/:questionId/answer')
    async submitAnswer(@Param('questionId') questionId:string, @CurrentUser() user:UserEntity,@Body() dto:CreateAnswerDto){
        return await this.questionService.submitAnswer(questionId,user,dto)
    }

    @Get('question/:questionId/answer')
    async getAnswers(@Param('questionId') questionId:string, @CurrentUser() user:UserEntity,@Query() query:PaginationQueryDto ){
        return await this.questionService.getAnswers(questionId,user,query);
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

    @Post('comment/:commentId/like')
    async likeComment(@Param('commentId') commentId: string, @CurrentUser() user: UserEntity) {
        return await this.postCommentService.likeComment(commentId, user.id)
    }

    @Delete('comment/:commentId/like')
    async unlikeComment(@Param('commentId') commentId: string, @CurrentUser() user: UserEntity) {
        return await this.postCommentService.unlikeComment(commentId, user.id)
    }

    @Post('answer/:answerId/vote')
    async voteAnswer(@Param('answerId') answerId:string,@CurrentUser() user:UserEntity){
        return await this.questionService.voteAnswer(answerId,user.id);
    }

    @Delete('answer/:answerId/vote')
    async unvoteAnswer(@Param('answerId') answerId:string,@CurrentUser() user:UserEntity){
        return await this.questionService.unvoteAnswer(answerId,user.id);
    }

    @Post('answer/:answerId/accept')
    async acceptAnswer(@Param('answerId') answerId:string, @CurrentUser() user:UserEntity){
        return this.questionService.acceptAnswer(answerId,user.id)
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

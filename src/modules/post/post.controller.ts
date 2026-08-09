import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/shared/dto/pagination-query.dto';

@Controller('post')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class PostController {

    constructor(private readonly postService: PostService) { }

    @Post()
    async createPost(@CurrentUser() user: UserEntity, @Body() dto:CreatePostDto) {
        return await this.postService.createPost(user.id,dto)
    }

    @Get()
    async getPosts(@Query() query:PaginationQueryDto){
        return await this.postService.getPosts(query);
    }

}

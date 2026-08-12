import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { PostReactionEntity } from './entities/post-reaction.entity';
import { PostReactionService } from './post-reaction.service';
import { HashTagEntity } from './entities/hashtag.entity';

@Module({
  imports:[TypeOrmModule.forFeature([PostEntity,PostReactionEntity,HashTagEntity])],
  providers: [PostService,PostReactionService],
  controllers: [PostController]
})
export class PostModule {}

import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { PostReactionEntity } from './entities/post-reaction.entity';

@Module({
  imports:[TypeOrmModule.forFeature([PostEntity,PostReactionEntity])],
  providers: [PostService],
  controllers: [PostController]
})
export class PostModule {}

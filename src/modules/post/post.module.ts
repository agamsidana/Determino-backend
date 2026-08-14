import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { PostReactionEntity } from './entities/post-reaction.entity';
import { PostReactionService } from './post-reaction.service';
import { HashTagEntity } from './entities/hashtag.entity';
import { PostAttachmentEntity } from './entities/post-attachment.entity';
import { PostAttachmentService } from './post-attachment.service';
import { PostUploadEntity } from './entities/post-upload.entity';
import { PostPollEntity } from './entities/post-poll.entity';
import { PostPollOptionEntity } from './entities/post-poll-option.entity';
import { PostPollVoteEntity } from './entities/post-poll-vote.entity';

@Module({
  imports:[TypeOrmModule.forFeature([PostEntity,PostReactionEntity,HashTagEntity,PostAttachmentEntity,PostUploadEntity,PostPollEntity,PostPollOptionEntity,PostPollVoteEntity])],
  providers: [PostService,PostReactionService,PostAttachmentService],
  controllers: [PostController]
})
export class PostModule {}

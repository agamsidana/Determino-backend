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
import { PostPollService } from './post-poll.service';
import { PostCommentService } from './post-comment.service';
import { PostCommentEntity } from './entities/post-comment.entity';
import { PostSaveEntity } from './entities/post-save.entity';
import { PostSaveService } from './post-save.service';
import { ProfileEntity } from '../profile/entities/profile.entity';

@Module({
  imports:[TypeOrmModule.forFeature([PostEntity,PostReactionEntity,HashTagEntity,PostAttachmentEntity,PostUploadEntity,PostPollEntity,PostPollOptionEntity,PostPollVoteEntity,PostCommentEntity,PostSaveEntity,ProfileEntity])],
  providers: [PostService,PostReactionService,PostAttachmentService,PostPollService,PostCommentService,PostSaveService],
  controllers: [PostController]
})
export class PostModule {}

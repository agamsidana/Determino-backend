import { UserEntity } from "src/modules/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { PostType } from "../enums/post-type.enum";
import { PostReactionEntity } from "./post-reaction.entity";
import { HashTagEntity } from "./hashtag.entity";
import { PostAttachmentEntity } from "./post-attachment.entity";
import { PostPollEntity } from "./post-poll.entity";
import { PostCommentEntity } from "./post-comment.entity";

@Entity({ name: 'posts' })
export class PostEntity {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    content!: string;

    @Column({ type: 'enum', enum: PostType })
    type!: PostType;

    @Column({ default: false })
    isDeleted!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @ManyToOne(() => UserEntity, (user) => user.posts)
    user!: UserEntity;

    @OneToMany(() => PostReactionEntity, (postReaction) => postReaction.post)
    reactions!: PostReactionEntity[];

    @ManyToMany(() => HashTagEntity, (hashTag) => hashTag.posts)
    @JoinTable({
        name: 'post_hashtags', 
        joinColumn: {
            name: 'postId',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'hashTagId',
            referencedColumnName: 'id',
        },
    })
    hashtags!: HashTagEntity[];

    @OneToMany(()=>PostAttachmentEntity,(postAttachment)=>postAttachment.post)
    attachments!:PostAttachmentEntity[];

    @OneToOne(()=>PostPollEntity,(postPoll)=>postPoll.post)
    poll!:PostPollEntity;

    @OneToMany(()=>PostCommentEntity,(postComment)=>postComment.post)
    comments!:PostCommentEntity[];

}
import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { PostCommentEntity } from "./post-comment.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";


@Entity({name:'post_comment_likes'})
@Unique('UQ_COMMENT_LIKE_USER', ['comment', 'user'])
export class PostCommentLikeEntity{

    @PrimaryGeneratedColumn('uuid')
    id!:string;

    @CreateDateColumn()
    createdAt!:Date;

    @ManyToOne(()=>PostCommentEntity,(postComment)=>postComment.likes,{
        onDelete:'CASCADE',
        nullable:false
    })
    comment!:PostCommentEntity;

    @ManyToOne(()=>UserEntity,(user)=>user.commentLikes,{
        onDelete:'CASCADE',
        nullable:false
    })
    user!:UserEntity;



}
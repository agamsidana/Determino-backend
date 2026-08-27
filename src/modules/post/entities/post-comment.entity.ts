import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PostEntity } from "./post.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { PostCommentLikeEntity } from "./post-comment-like.entity";


@Entity({name:'post_comments'})
export class PostCommentEntity {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    content!: string;

    @Column({default:false})
    isDeleted!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @ManyToOne(()=>PostEntity,(post)=>post.comments,{onDelete:'CASCADE',nullable:false})
    post!:PostEntity;

    @ManyToOne(()=>UserEntity,(user)=>user.postComments,{onDelete:'CASCADE',nullable:false})
    user!:UserEntity;

    @OneToMany(()=>PostCommentLikeEntity,(postCommentLike)=>postCommentLike.comment)
    likes!:PostCommentLikeEntity[];

}
import { CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { PostEntity } from "./post.entity";
import { PostPollOptionEntity } from "./post-poll-option.entity";
import { PostPollVoteEntity } from "./post-poll-vote.entity";


@Entity({
    name: 'post_polls',
})
export class PostPollEntity{

    @PrimaryGeneratedColumn('uuid')
    id!:string;

    @CreateDateColumn()
    createdAt!:Date;

    @OneToOne(()=>PostEntity,(post)=>post.poll,{onDelete:'CASCADE'})
    @JoinColumn({name:'postId'})
    post!:PostEntity;

    @OneToMany(()=>PostPollOptionEntity,(postPollOption)=>postPollOption.postPoll)
    options!:PostPollOptionEntity[];

    @OneToMany(()=>PostPollVoteEntity,(postPollVote)=>postPollVote.poll)
    votes!:PostPollVoteEntity[];

}
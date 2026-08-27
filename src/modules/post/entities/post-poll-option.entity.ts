import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PostPollEntity } from "./post-poll.entity";
import { PostPollVoteEntity } from "./post-poll-vote.entity";


@Entity({name:'post_poll_options'})
export class PostPollOptionEntity{

    @PrimaryGeneratedColumn('uuid')
    id!:string;

    @Column()
    text!:string;

    @Column()
    position!:number;

    @CreateDateColumn()
    createdAt!:Date;

    @ManyToOne(()=>PostPollEntity,(postPoll)=>postPoll.options,{onDelete:'CASCADE',nullable:false})
    postPoll!:PostPollEntity;

    @OneToMany(()=>PostPollVoteEntity,(postPollVote)=>postPollVote.option)
    votes!:PostPollVoteEntity[];


}
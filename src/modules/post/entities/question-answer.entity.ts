import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PostEntity } from "./post.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { AnswerVoteEntity } from "./answer-vote.entity";

@Entity({ name: 'question_answers'})
export class QuestionAnswerEntity{

    @PrimaryGeneratedColumn('uuid')
    id!:string;

    @Column({type:'text'})
    content!:string;

    @Column({default:false})
    isAccepted!:boolean;

    @Column({default:false})
    isDeleted!:boolean;

    @CreateDateColumn()
    createdAt!:Date;

    @ManyToOne(()=>PostEntity,(post)=>post.answers,{onDelete:'CASCADE',nullable:false})
    post!:PostEntity;

    @ManyToOne(()=>UserEntity,(user)=>user.answers,{onDelete:'CASCADE',nullable:false})
    user!:UserEntity;

    @OneToMany(()=>AnswerVoteEntity,(answerVote)=>answerVote.answer)
    votes!:AnswerVoteEntity[];

}
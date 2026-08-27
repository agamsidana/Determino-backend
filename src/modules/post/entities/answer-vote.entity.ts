import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { QuestionAnswerEntity } from "./question-answer.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";

@Entity({ name: 'answer_votes' })
@Unique('UQ_ANSWER_VOTE_USER', ['answer', 'user'])
export class AnswerVoteEntity{

    @PrimaryGeneratedColumn('uuid')
    id!:string;

    @CreateDateColumn()
    createdAt!:Date;

    @ManyToOne(()=>QuestionAnswerEntity,(questionAnswer)=>questionAnswer.votes,{onDelete:'CASCADE',nullable:false})
    answer!:QuestionAnswerEntity;

    @ManyToOne(()=>UserEntity,(user)=>user.answerVotes,{onDelete:'CASCADE',nullable:false})
    user!:UserEntity;

}
import { ChallengeEntity } from "src/modules/challenge/entities/challenge.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { QuizQuestionEntity } from "./quiz-question.entity";
import { QuizAttemptEntity } from "./quiz-attempt.entity";

@Entity({ name: 'quizzes' })
@Unique('UQ_QUIZ_CHALLENGE_DATE', ['challenge', 'quizDate'])
export class QuizEntity{

    @PrimaryGeneratedColumn('uuid')
    id!:string;

    @Column()
    title!:string;

    @Column({type:'date'})
    quizDate!:string;

    @Column({default:true})
    isActive!:boolean;

    @CreateDateColumn()
    createdAt!:Date;

    @ManyToOne(()=>ChallengeEntity,(challenge)=>challenge.quizess,{onDelete:'CASCADE',nullable:false})
    challenge!:ChallengeEntity;

    @OneToMany(()=>QuizQuestionEntity,(quizQuestion)=>quizQuestion.quiz)
    questions!:QuizQuestionEntity[];

    @OneToMany(()=>QuizAttemptEntity,(quizAttempt)=>quizAttempt.quiz)
    attempts!:QuizAttemptEntity[]
}
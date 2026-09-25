import { UserEntity } from "src/modules/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { QuizEntity } from "./quiz.entity";
import { QuizAttemptAnswerEntity } from "./quiz-attempt-answer.entity";

@Entity({ name: 'quiz_attempts' })
@Unique('UQ_QUIZ_ATTEMPT_USER_QUIZ', ['user', 'quiz'])
export class QuizAttemptEntity{

    @PrimaryGeneratedColumn('uuid')
    id!:string;

    @Column({type:'int'})
    score!:number;

    @Column({type:'int'})
    totalQuestions!:number;

    @CreateDateColumn()
    submittedAt!:Date;

    @ManyToOne(()=>UserEntity,(user)=>user.quizAttempts,{onDelete:'CASCADE',nullable:false})
    user!:UserEntity;

    @ManyToOne(()=>QuizEntity,(quiz)=>quiz.attempts,{onDelete:'CASCADE',nullable:false})
    quiz!:QuizEntity;

    @OneToMany(()=>QuizAttemptAnswerEntity,(quizAttemptAnswer)=>quizAttemptAnswer.attempt)
    attemptAnswers!:QuizAttemptAnswerEntity[];

}
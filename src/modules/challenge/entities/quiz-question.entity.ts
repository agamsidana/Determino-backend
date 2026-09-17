import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { QuizEntity } from "./quiz.entity";
import { QuizAttemptAnswerEntity } from "./quiz-attempt-answer.entity";

@Entity({name:'quiz_questions'})
export class QuizQuestionEntity{

    @PrimaryGeneratedColumn('uuid')
    id!:string;

    @Column({type:'text'})
    question!:string;

    @Column({type:'text'})
    optionA!:string;

    @Column({type:'text'})
    optionB!:string;

    @Column({type:'text'})
    optionC!:string;

    @Column({type:'text'})
    optionD!:string;

    @Column({type:'text'})
    correctOption!:string;

    @ManyToOne(()=> QuizEntity,(quiz)=>quiz.questions,{onDelete:'CASCADE',nullable:false})
    quiz!:QuizEntity;

    @OneToMany(()=>QuizAttemptAnswerEntity,(quizAttemptAnswer)=>quizAttemptAnswer.question)
    answers!:QuizAttemptAnswerEntity[]

}
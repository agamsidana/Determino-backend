import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { QuizAttemptEntity } from "./quiz-attempt.entity";
import { QuizQuestionEntity } from "./quiz-question.entity";


@Entity({ name: 'quiz_attempt_answers' })
@Unique('UQ_QUIZ_ATTEMPT_QUESTION', ['attempt', 'question'])
export class QuizAttemptAnswerEntity{

    @PrimaryGeneratedColumn('uuid')
    id!:string;

    @Column({type:'text'})
    selectedOption!:string;

    @Column()
    isCorrect!:boolean;

    @ManyToOne(()=>QuizAttemptEntity,(quizAttempt)=>quizAttempt.attemptAnswers,{onDelete:'CASCADE',nullable:false})
    attempt!:QuizAttemptEntity;

    @ManyToOne(()=>QuizQuestionEntity,(quizQuestion)=>quizQuestion.answers,{onDelete:'CASCADE',nullable:false})
    question!:QuizQuestionEntity;


}
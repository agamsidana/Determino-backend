import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ChallengeType } from "../enums/challenge-type.enum";
import { HabitGoalType } from "../enums/habit-goal-type.enum";
import { ResetPeriod } from "../enums/reset-period.enum";
import { ChallengeParticipantEntity } from "./challenge-participant.entity";
import { ChallengeProgressEntity } from "./challenge-progress.entity";

@Entity({name:'challenges'})
export class ChallengeEntity{

    @PrimaryGeneratedColumn('uuid')
    id!:string;

    @Column()
    title!:string;

    @Column()
    description!:string;

    @Column({type:'enum',enum:ChallengeType})
    type!:ChallengeType;

    @Column({type:'enum',enum:HabitGoalType,nullable:true})
    goalType!:HabitGoalType;

    @Column({nullable:true})
    targetValue?:number;

    @Column({type:'enum',enum:ResetPeriod,nullable:true})
    resetPeriod!:ResetPeriod;

    @Column({default:true})
    isActive!:boolean;

    @CreateDateColumn()
    createdAt!:Date; 

    @OneToMany(()=>ChallengeParticipantEntity,(challengeParticipant)=>challengeParticipant.challenge)
    participants!:ChallengeParticipantEntity[];

    @OneToMany(()=>ChallengeProgressEntity,(challengeProgress)=>challengeProgress.challenge)
    challengeProgress!:ChallengeProgressEntity[];

}
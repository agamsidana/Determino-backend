import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { ChallengeEntity } from "./challenge.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";


@Entity({name:'challenge_progress'})
@Unique('UQ_CHALLENGE_PROGRESS_PERIOD', ['challenge', 'user', 'periodStart'])
export class ChallengeProgressEntity{

    @PrimaryGeneratedColumn('uuid')
    id!:string;

    @Column({type:'date'})
    periodStart!:string;

    @Column({default:0})
    progress!:number;

    @Column({default:false})
    isCompleted!:boolean;

    @CreateDateColumn()
    createdAt!:Date;

    @ManyToOne(()=>ChallengeEntity,(challenge)=>challenge.challengeProgress,{onDelete:'CASCADE',nullable:false})
    challenge!:ChallengeEntity;

    @ManyToOne(()=>UserEntity,(user)=>user.challengeProgress,{onDelete:'CASCADE',nullable:false})
    user!:UserEntity;

}
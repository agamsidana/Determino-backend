import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { ChallengeEntity } from "./challenge.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";

@Entity({name:'challenge_participants'})
@Unique('UQ_CHALLENGE_PARTICIPANT_USER', ['challenge', 'user'])
export class ChallengeParticipantEntity{

    @PrimaryGeneratedColumn('uuid')
    id!:string;

    @CreateDateColumn()
    joinedAt!:Date;

    @ManyToOne(()=>ChallengeEntity,(challenge)=>challenge.participants,{onDelete:'CASCADE',nullable:false})
    challenge!:ChallengeEntity;

    @ManyToOne(()=>UserEntity,(user)=>user.challengeParticipations,{onDelete:'CASCADE',nullable:false})
    user!:UserEntity;

}
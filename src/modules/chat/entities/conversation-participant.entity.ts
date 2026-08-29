import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { ConversationEntity } from "./conversation.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";


@Entity({name:'conversation_participants'})
@Unique('UQ_CONVERSATION_PARTICIPANT_USER', ['conversation', 'user'])
export class ConversationParticipantEntity{

    @PrimaryGeneratedColumn('uuid')
    id!:string;

    @CreateDateColumn()
    joinedAt!: Date;

    @ManyToOne(()=>ConversationEntity,(conversation)=>conversation.participants,{
        onDelete:'CASCADE',
        nullable:false
    })
    conversation!:ConversationEntity;

    @ManyToOne(()=>UserEntity,(user)=>user.conversationParticipations,{
        onDelete:'CASCADE',
        nullable:false
    })
    user!:UserEntity;

    

}
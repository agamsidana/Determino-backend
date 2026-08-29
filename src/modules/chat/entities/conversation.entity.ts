import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { ConversationType } from "../enums/conversation-type.enum";
import { GroupEntity } from "src/modules/group/entities/group.entity";
import { ConversationParticipantEntity } from "./conversation-participant.entity";
import { MessageEntity } from "./message.entity";

@Entity({name:'conversations'})
export class ConversationEntity{

    @PrimaryGeneratedColumn('uuid')
    id!:string;

    @Column({type:'enum',enum:ConversationType})
    type!:ConversationType;

    @CreateDateColumn()
    createdAt!:Date;

    @OneToOne(()=>GroupEntity,(group)=>group.conversation,{onDelete:'CASCADE',nullable:true})
    @JoinColumn()
    group!:GroupEntity;

    @OneToMany(()=>ConversationParticipantEntity,(conversationParticipant)=>conversationParticipant.conversation)
    participants!:ConversationParticipantEntity[];

    @OneToMany(()=>MessageEntity,(message)=>message.conversation)
    messages!:MessageEntity[];

}
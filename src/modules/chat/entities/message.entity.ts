import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ConversationEntity } from "./conversation.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { MessageType } from "../enums/message-type.enum";
import { SystemEventType } from "../enums/systemEvent-type.enum";



@Entity({ name: 'messages' }) 
export class MessageEntity{

    @PrimaryGeneratedColumn('uuid')
    id!:string;

    @Column({type:'enum',enum:MessageType,default:MessageType.TEXT})
    type!:MessageType;

    @Column({type:'enum',enum:SystemEventType,nullable:true})
    systemEventType!:SystemEventType;

    @Column({type:'text',nullable:true})
    content!:string;

    @Column({default:false})
    isDeleted!:boolean;

    @CreateDateColumn()
    createdAt!:Date;

    @ManyToOne(()=>ConversationEntity,(conversation)=>conversation.messages,{
        onDelete:'CASCADE',
        nullable:false
    })
    conversation!:ConversationEntity;

    @ManyToOne(()=>UserEntity,(user)=>user.messagesSent,{
        onDelete:'CASCADE',
        nullable:false
    })
    sender!:UserEntity

}
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ConversationEntity } from "./conversation.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";



@Entity({ name: 'messages' }) 
export class MessageEntity{

    @PrimaryGeneratedColumn('uuid')
    id!:string;

    @Column({type:'text'})
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
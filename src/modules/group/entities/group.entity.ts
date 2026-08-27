import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { GroupMemberEntity } from "./group-member.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";

@Entity({name:'groups'})
export class GroupEntity{

    @PrimaryGeneratedColumn('uuid')
    id!:string;

    @Column()
    name!:string;

    @Column({nullable:true})
    description!:string;

    @Column({default:false})
    isDeleted!:boolean;

    @CreateDateColumn()
    createdAt!:Date;

    @UpdateDateColumn()
    updatedAt!:Date;

    @ManyToOne(()=>UserEntity,(user)=>user.createdGroups,{
        onDelete:'SET NULL',
        nullable:true
    })
    createdBy!:UserEntity;   

    @OneToMany(()=>GroupMemberEntity,(groupMember)=>groupMember.group)
    members!:GroupMemberEntity[];

}
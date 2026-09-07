import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { GroupEntity } from "./group.entity";
import { GroupRole } from "../enums/group-role.enum";
import { UserEntity } from "src/modules/user/entities/user.entity";

@Entity({name:'group_members'})
@Unique('UQ_GROUP_MEMBER_GROUP_USER', ['group', 'user'])
export class GroupMemberEntity{

    @PrimaryGeneratedColumn('uuid')
    id!:string;

    @Column({
        type:'enum',
        enum:GroupRole,
        default:GroupRole.MEMBER
    })
    role!:GroupRole;

    @ManyToOne(()=>GroupEntity,(group)=>group.members,{
        onDelete:'CASCADE',
        nullable:false
    })
    group!:GroupEntity;

    @ManyToOne(()=>UserEntity,(user)=>user.groupMemberships,{
        onDelete:'CASCADE',
        nullable:false
    })
    user!:UserEntity;

    @CreateDateColumn()
    joinedAt!:Date;


}
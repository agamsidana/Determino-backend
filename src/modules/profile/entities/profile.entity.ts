import { UserEntity } from "src/modules/user/entities/user.entity";
import { Role } from "src/shared/enums/role.enum";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({name:'profiles'})
export class ProfileEntity{

    @PrimaryGeneratedColumn('uuid')
    id!:string;

    @Column()
    firstName!:string;

    @Column()
    lastName!:string;

    @Column({
        nullable:true
    })
    avatar!:string;

    @Column({type:'enum',enum:Role,nullable:true})
    role!:Role;

    @Column({default:false})
    isOnboardingCompleted!:boolean;

    @Column({
        default:1
    })
    currentOnboardingStep!:number;

    @CreateDateColumn()
    createdAt!:Date;

    @UpdateDateColumn()
    updatedAt!:Date;

    @OneToOne(()=>UserEntity,(user)=>user.profile)
    @JoinColumn({name:'userId'})
    user!:UserEntity;


}
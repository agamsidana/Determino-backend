import { ExamEntity } from "src/modules/exam/entities/exam.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { Role } from "src/shared/enums/role.enum";
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { OnboardingStep } from "../enums/onboardingStep.enum";
import { GoalEntity } from "src/modules/goal/entities/goal.entity";

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

    @Column({
        nullable:true
    })
    bio!:string;

    @Column({type:'enum',enum:Role,nullable:true})
    role!:Role;

    @Column({default:false})
    isOnboardingCompleted!:boolean;

    @Column({
        default:OnboardingStep.WELCOME
    })
    currentOnboardingStep!:number;

    @CreateDateColumn()
    createdAt!:Date;

    @UpdateDateColumn()
    updatedAt!:Date;

    @OneToOne(()=>UserEntity,(user)=>user.profile)
    @JoinColumn({name:'userId'})
    user!:UserEntity;

    @ManyToOne(()=>ExamEntity,(exam)=>exam.profiles,{nullable:true})
    @JoinColumn({name:'examId'})
    exam!:ExamEntity;

    @ManyToMany(()=>GoalEntity,(goal)=>goal.profiles)
    @JoinTable({name:'profile_goals'})
    goals!:GoalEntity[];


}
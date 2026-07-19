import { ProfileEntity } from "src/modules/profile/entities/profile.entity";
import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({name:'goals'})
export class GoalEntity{

    @PrimaryGeneratedColumn('uuid')
    id!:string;

    @Column()
    name!:string;

    @Column()
    icon!:string;

    @Column()
    iconColor!:string;

    @Column({default:true})
    isActive!:boolean;

    @CreateDateColumn()
    createdAt!:Date;

    @UpdateDateColumn()
    updatedAt!:Date;

    @ManyToMany(()=>ProfileEntity,(profile)=>profile.goals)
    profiles!:ProfileEntity[];

}
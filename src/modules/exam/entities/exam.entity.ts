import { ProfileEntity } from "src/modules/profile/entities/profile.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({name:'exams'})
export class ExamEntity{

    @PrimaryGeneratedColumn('uuid')
    id!:string;

    @Column()
    name!:string;

    @Column()
    icon!:string;

    @Column()
    iconColor!:string

    @Column({default:true})
    isActive!:boolean;

    @Column({default:true})
    isPopular!:boolean;

    @CreateDateColumn()
    createdAt!:Date;

    @UpdateDateColumn()
    updatedAt!:Date;

    @OneToMany(()=>ProfileEntity,(profile)=>profile.exam)
    profiles!:ProfileEntity[];
    
}
import { PostEntity } from "src/modules/post/entities/post.entity";
import { ProfileEntity } from "src/modules/profile/entities/profile.entity";
import { StudySessionEntity } from "src/modules/study-session/entities/study-session.entity";
import { Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({name:'users'})
export class UserEntity{

    @PrimaryGeneratedColumn('uuid')
    id!:string;

    @Column({
        unique:true
    })
    email!:string;

    @Column({
        nullable:true,
        select:false,
    })
    password!:string;

    @CreateDateColumn()
    createdAt!:Date;

    @UpdateDateColumn()
    updatedAt!:Date;

    @OneToOne(()=>ProfileEntity,(profile)=>profile.user)
    profile!:ProfileEntity;

    @OneToMany(()=>StudySessionEntity,(studySession)=>studySession.user)
    studySessions!:StudySessionEntity[];

    @OneToMany(()=>PostEntity,(post)=>post.user)
    posts!:PostEntity[];

}
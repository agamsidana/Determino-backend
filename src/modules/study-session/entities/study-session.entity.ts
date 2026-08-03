import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { StudySession } from "../enums/study-session-status.enum";
import { UserEntity } from "src/modules/user/entities/user.entity";


@Entity({ name: 'study_sessions' })
@Index(['user','status'])
export class StudySessionEntity {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        type:'enum',
        enum:StudySession,
    })
    status!: StudySession;

    @Column({
        type:'timestamp'
    })
    startedAt!: Date;

    @Column({ 
        type:'timestamp',
        nullable: true,
    })
    endedAt!: Date;

    @Column({
        type:'timestamp',
        nullable:true
    })
    pausedAt!:Date | null;

    @Column({
        default:0
    })
    totalPausedSeconds!: number;

    @Column()
    plannedDurationMinutes!:number;

    @Column({
        default:0
    })
    actualStudySeconds!:number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @ManyToOne(()=>UserEntity,(user)=>user.studySessions,{nullable:false,onDelete:'CASCADE'})
    @JoinColumn({name:'userId'})
    user!:UserEntity;

}
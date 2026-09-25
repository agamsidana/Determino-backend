import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { ConnectionStatus } from "../enums/connection-status.enum";
import { UserEntity } from "src/modules/user/entities/user.entity";

@Entity({ name: 'prepmate_connections' })
@Unique('UQ_PREPMATE_CONNECTION_USERS', ['userLow', 'userHigh'])
export class PrepMateConnectionEntity{

    @PrimaryGeneratedColumn('uuid')
    id!:string;

    @Column({type:'enum',enum:ConnectionStatus,default:ConnectionStatus.PENDING})
    status!:ConnectionStatus;

    @ManyToOne(()=>UserEntity,(user)=>user.prepmateConnectionsAsLowUser,{onDelete:'CASCADE',nullable:false})
    userLow!:UserEntity;

    @ManyToOne(()=>UserEntity,(user)=>user.prepmateConnectionsAsHighUser,{onDelete:'CASCADE',nullable:false})
    userHigh!:UserEntity;

    @ManyToOne(()=>UserEntity,(user)=>user.prepmateRequestsSent,{onDelete:'CASCADE',nullable:false})
    requester!:UserEntity;

    @ManyToOne(()=>UserEntity,(user)=>user.prepmateRequestsReceived,{onDelete:'CASCADE',nullable:false})
    receiver!:UserEntity;

    @CreateDateColumn()
    createdAt!:Date;

    @UpdateDateColumn()
    updatedAt!:Date;


}
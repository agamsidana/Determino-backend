import { ProfileEntity } from "src/modules/profile/entities/profile.entity";
import { AuthProvider } from "src/shared/enums/auth-provider.enum";
import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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
    password?:string;

    @Column({
        nullable:true
    })
    googleId!:string;

    @Column({
        type:'enum',
        enum:AuthProvider,
        default:AuthProvider.LOCAL
    })
    provider!:AuthProvider;

    @CreateDateColumn()
    createdAt!:Date;

    @UpdateDateColumn()
    updatedAt!:Date;

    @OneToOne(()=>ProfileEntity,(profile)=>profile.user)
    profile!:ProfileEntity;

}
import { UserEntity } from "src/modules/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { PostType } from "../enums/post-type.enum";

@Entity({name:'posts'})
export class PostEntity{

    @PrimaryGeneratedColumn('uuid')
    id!:string;

    @Column()
    title!:string;

    @Column()
    content!:string;

    @Column({type:'enum',enum:PostType})
    type!:PostType;

    @Column({default:false})
    isDeleted!:boolean

    @CreateDateColumn()
    createdAt!:Date;

    @UpdateDateColumn()
    updatedAt!:Date;

    @ManyToOne(()=>UserEntity,(user)=> user.posts)
    user!:UserEntity;

}
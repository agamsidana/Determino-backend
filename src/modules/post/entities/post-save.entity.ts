import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { PostEntity } from "./post.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";

@Entity({name:'post_saves'})
@Unique('UQ_POST_SAVE_USER_POST', ['user', 'post'])
export class PostSaveEntity{

    @PrimaryGeneratedColumn('uuid')
    id!:string;

    @CreateDateColumn()
    createdAt!:Date;

    @ManyToOne(()=>PostEntity,(post)=>post.saves,{onDelete:'CASCADE',nullable:false})
    post!:PostEntity;

    @ManyToOne(()=>UserEntity,(user)=>user.postSaves,{onDelete:'CASCADE',nullable:false})
    user!:UserEntity;

}
import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { PostEntity } from "./post.entity";

@Entity({ name: 'hashtags' })
export class HashTagEntity{

    @PrimaryGeneratedColumn('uuid')
    id!:string;

    @Column({
        unique:true
    })
    name!:string;

    @CreateDateColumn()
    createdAt!:Date;

    @ManyToMany(()=>PostEntity,(post)=>post.hashtags)
    posts!:PostEntity[];

}
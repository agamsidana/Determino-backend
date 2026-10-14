import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name:'contacts'})
export class ContactEntity{

    @PrimaryGeneratedColumn('uuid')
    id!:string;

    @Column()
    name!:string;

    @Column()
    email!:string;

    @Column()
    topic!:string;

    @Column({type:'text'})
    subject!:string;

    @Column({type:'text'})
    message!:string


}
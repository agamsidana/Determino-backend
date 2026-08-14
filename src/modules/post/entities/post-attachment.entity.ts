import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PostAttachmentType } from "../enums/post-attachment-type.enum";
import { PostEntity } from "./post.entity";
import { UploadMimeType } from "../enums/upload-mime-type.enum";

@Entity({name : 'post_attachments'})
export class PostAttachmentEntity {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'enum', enum: PostAttachmentType })
    type!: PostAttachmentType;

    @Column()
    storagePath!: string;

    @Column({ nullable: true })
    fileName!: string;

    @Column({type:'enum',enum:UploadMimeType})
    mimeType!: UploadMimeType;

    @Column({ type: 'bigint', nullable: true })
    fileSize!: number;

    @CreateDateColumn()
    createdAt!:Date;

    @ManyToOne(()=>PostEntity,(post)=>post.attachments,{
        onDelete:'CASCADE',
        nullable:false
    })
    post!:PostEntity;


}
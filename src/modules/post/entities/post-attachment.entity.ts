import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PostAttachmentType } from "../enums/post-attachment-type.enum";
import { PostEntity } from "./post.entity";
import { UploadMimeType } from "../../../shared/enums/upload-mime-type.enum";

@Entity({name : 'post_attachments'})
export class PostAttachmentEntity {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'enum', enum: PostAttachmentType })
    type!: PostAttachmentType;

    @Column({nullable:true})
    storagePath!: string;

    @Column({ nullable: true })
    fileName!: string;

    @Column({type:'enum',enum:UploadMimeType,nullable:true})
    mimeType!: UploadMimeType;

    @Column({ type: 'bigint', nullable: true })
    fileSize!: number;

    @Column({nullable:true})
    url!:string;

    @CreateDateColumn()
    createdAt!:Date;

    @ManyToOne(()=>PostEntity,(post)=>post.attachments,{
        onDelete:'CASCADE',
        nullable:false
    })
    post!:PostEntity;


}
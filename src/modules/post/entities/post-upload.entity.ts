import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { UploadMimeType } from "../../../shared/enums/upload-mime-type.enum";
import { PostAttachmentType } from "../enums/post-attachment-type.enum";


@Entity({name:'post_uploads'})
export class PostUploadEntity{

    @PrimaryGeneratedColumn('uuid')
    id!:string;

    @Column()
    userId!:string;

    @Column({
        type:'enum',
        enum:PostAttachmentType
    })
    type!:PostAttachmentType

    @Column()
    storagePath!:string;

    @Column()
    fileName!:string;

    @Column({type:'enum',enum:UploadMimeType})
    mimeType!:UploadMimeType;

    @Column({type:'bigint'})
    fileSize!:number;

    @Column({default:false})
    isUsed!:boolean;

    @CreateDateColumn()
    createdAt!:Date;

}
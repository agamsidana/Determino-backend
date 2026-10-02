import { UploadMimeType } from "src/shared/enums/upload-mime-type.enum";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity({ name: 'avatar_uploads' })
@Unique('UQ_AVATAR_UPLOAD_STORAGE_PATH', ['storagePath'])
export class AvatarUploadEntity {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    userId!:string

    @Column()
    storagePath!: string;

    @Column()
    fileName!: string;

    @Column({ type: 'enum', enum: UploadMimeType })
    mimeType!: UploadMimeType;

    @Column({ type: 'bigint' })
    fileSize!: number;

    @Column({default:false})
    isUsed!:boolean;

    @CreateDateColumn()
    createdAt!:Date;
    
}
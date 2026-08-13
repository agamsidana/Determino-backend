import { Injectable } from "@nestjs/common";
import { SupabaseStorageService } from "src/shared/supabase/supabase-storage.service";
import { CreateAttachmentUploadUrlDto } from "./dto/create-attachment-upload-url.dto";
import { randomUUID } from 'crypto'
import { InjectRepository } from "@nestjs/typeorm";
import { PostUploadEntity } from "./entities/post-upload.entity";
import { Repository } from "typeorm";


@Injectable()
export class PostAttachmentService {

    constructor(private readonly supabaseStorageService: SupabaseStorageService, @InjectRepository(PostUploadEntity) private readonly PostUploadRepository: Repository<PostUploadEntity>) { }

    async createUploadUrl(userId: string, dto: CreateAttachmentUploadUrlDto) {

        const { fileName, fileSize, mimeType, type } = dto;

        const uploadId = randomUUID();

        const storagePath =
            `temp/${userId}/${uploadId}/${dto.fileName}`;

        const signedUpload =
            await this.supabaseStorageService.createUploadUrl(
                'post-attachments',
                storagePath,
            );


        const upload = this.PostUploadRepository.create({
            id: uploadId,
            fileName,
            mimeType,
            storagePath,
            fileSize,
            type,
            userId
        })

        await this.PostUploadRepository.save(upload);

        return {
            data: {
                uploadId,
                storagePath,
                uploadUrl: signedUpload.signedUrl,
            },
        };


    }

}
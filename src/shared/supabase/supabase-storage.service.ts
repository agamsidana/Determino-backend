import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from './supabase.constants';

@Injectable()
export class SupabaseStorageService {

    constructor(
        @Inject(SUPABASE_CLIENT)
        private readonly supabase: SupabaseClient,
    ) {}

    async createUploadUrl(bucket:string,path:string){
        const {data,error}=await this.supabase.storage.from(bucket).createSignedUploadUrl(path);
        if(error){
            throw error;
        }

        return data;
    }

    async createDownloadUrl(bucket:string,path:string,expiresIn:number){

        const {data,error}=await this.supabase.storage.from(bucket).createSignedUrl(path,expiresIn);
        if(error){
            throw error
        }

        return data.signedUrl;
        
    }

    async createPublicUrl(bucket: string, path: string) {
        const { data } = this.supabase
            .storage
            .from(bucket)
            .getPublicUrl(path);

        return data.publicUrl;
    }

}
import { Inject, Provider } from "@nestjs/common";
import { SUPABASE_CLIENT } from "./supabase.constants";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const supabaseProvider:Provider={
    provide:SUPABASE_CLIENT,
    useFactory:(configService:ConfigService):SupabaseClient=>{
        const url=configService.getOrThrow<string>('SUPABASE_URL');
        const serviceRoleKey=configService.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY');
        return createClient(url,serviceRoleKey,{
            auth:{
                persistSession:false
            }
        });
    },
    inject:[ConfigService],
};
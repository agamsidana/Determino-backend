import { Global, Module } from '@nestjs/common';
import { supabaseProvider } from './supabase.provider';
import { SupabaseStorageService } from './supabase-storage.service';

@Global()
@Module({
    providers: [supabaseProvider,SupabaseStorageService],
    exports: [supabaseProvider,SupabaseStorageService],
})
export class SupabaseModule {}
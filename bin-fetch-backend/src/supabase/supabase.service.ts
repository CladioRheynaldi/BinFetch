import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabase!: SupabaseClient;  

onModuleInit() {
  console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
  console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'exists' : 'missing');
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  if (!url || !key) throw new Error('Missing Supabase credentials');
  this.supabase = createClient(url, key);
}
  getClient() {
    return this.supabase;
  }
}
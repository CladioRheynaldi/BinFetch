import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables are missing!');
    }

    // Initialize the client with the Service Role Key
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // This allows other parts of our app to use the database connection
  getClient(): SupabaseClient {
    return this.supabase;
  }
}
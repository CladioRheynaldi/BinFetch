import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { SupabaseModule } from './supabase/supabase.module';
import { CustomerModule } from './customer/customer.module';
import { StaffModule } from './staff/staff.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [AuthModule, SupabaseModule, CustomerModule, StaffModule, ChatModule],
})
export class AppModule {}
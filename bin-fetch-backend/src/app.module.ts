import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { SupabaseModule } from './supabase/supabase.module';
import { CustomerModule } from './customer/customer.module';
import { StaffModule } from './staff/staff.module';

@Module({
  imports: [AuthModule, SupabaseModule, CustomerModule, StaffModule],
})
export class AppModule {}
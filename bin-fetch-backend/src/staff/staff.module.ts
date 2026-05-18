import { Module } from '@nestjs/common';
import { StaffPickupController } from './pickup/staff-pickup.controller';
import { StaffPickupService } from './pickup/staff-pickup.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [StaffPickupController],
  providers: [StaffPickupService],
})
export class StaffModule {}
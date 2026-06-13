import { Module } from '@nestjs/common';
import { CustomerPickupController } from './pickup/customer-pickup.controller';
import { CustomerPickupService } from './pickup/customer-pickup.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { RewardsModule } from './reward/rewards.module';

@Module({
  imports: [SupabaseModule, RewardsModule],
  controllers: [CustomerPickupController],
  providers: [CustomerPickupService],
})
export class CustomerModule {}
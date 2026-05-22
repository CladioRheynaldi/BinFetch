import { Module } from '@nestjs/common';
import { CustomerRewardsController } from './customer-rewards.controller';
import { CustomerRewardsService } from './customer-rewards.service';
import { SupabaseModule } from '../../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [CustomerRewardsController],
  providers: [CustomerRewardsService],
})
export class RewardsModule {}
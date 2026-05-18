import { Module } from '@nestjs/common';
import { CustomerPickupController } from './pickup/customer-pickup.controller';
import { CustomerPickupService } from './pickup/customer-pickup.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [CustomerPickupController],
  providers: [CustomerPickupService],
})
export class CustomerModule {}
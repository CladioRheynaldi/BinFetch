import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreatePickupDto } from './dto/create-pickup.dto';

@Injectable()
export class CustomerPickupService {
  constructor(private supabaseService: SupabaseService) {}

  async create(userId: string, dto: CreatePickupDto) {
    const supabase = this.supabaseService.getClient();

    // 1. Ensure the user is a customer
    const { data: customer, error: checkError } = await supabase
      .from('customers')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    if (checkError || !customer) {
      throw new ForbiddenException('Only customers can request pickups');
    }

    // 2. Find staff member with the smallest workload
    const { data: staffMember, error: staffError } = await supabase
      .from('staff')
      .select('user_id, workload')
      .order('workload', { ascending: true })
      .limit(1)
      .single();

    if (staffError || !staffMember) {
      throw new BadRequestException('No staff available to assign this pickup');
    }

    // 3. Create the pickup request, auto-assign to selected staff
    const { data: pickup, error: insertError } = await supabase
      .from('pickup_requests')
      .insert({
        user_id: userId,
        waste_type: dto.waste_type,
        volume_kg: dto.volume_kg,
        pickup_address: dto.pickup_address,
        pickup_lat: dto.pickup_lat,
        pickup_lng: dto.pickup_lng,
        special_instructions: dto.special_instructions,
        status: 'pending',               // Staff can accept/reject later
        assigned_staff_id: staffMember.user_id,
      })
      .select()
      .single();

    if (insertError) {
      throw new ForbiddenException('Failed to create pickup request');
    }

    // 4. Increment the staff's workload by 1 (atomic update)
    const { error: workloadError } = await supabase
      .from('staff')
      .update({ workload: staffMember.workload + 1 })
      .eq('user_id', staffMember.user_id);

    if (workloadError) {
      console.error('Failed to update staff workload:', workloadError);
      // Not critical for the pickup creation, but log it.
    }

    return {
      message: 'Pickup request created and assigned to available staff',
      pickup: pickup,
      assigned_staff_id: staffMember.user_id,
    };
  }

  async findByUser(userId: string) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('pickup_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new NotFoundException('Could not fetch pickups');
    return data;
  }
}


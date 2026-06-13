import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreatePickupDto } from './dto/create-pickup.dto';
import { UpdatePickupDto } from './dto/update-pickup.dto';

@Injectable()
export class CustomerPickupService {
  constructor(private supabaseService: SupabaseService) {}

  async create(userId: string, dto: CreatePickupDto) {
    const supabase = this.supabaseService.getClient();

    
    const { data: customer, error: checkError } = await supabase
      .from('customers')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    if (checkError || !customer) {
      throw new ForbiddenException('Only customers can request pickups');
    }

    
    const { data: staffMember, error: staffError } = await supabase
      .from('staff')
      .select('user_id, workload')
      .order('workload', { ascending: true })
      .limit(1)
      .single();

    if (staffError || !staffMember) {
      throw new BadRequestException('No staff available to assign this pickup');
    }

    
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
        created_at: dto.created_at || new Date().toISOString(),
        status: 'pending',               
        assigned_staff_id: staffMember.user_id,
      })
      .select()
      .single();

    if (insertError) {
      throw new ForbiddenException('Failed to create pickup request');
    }

    
    const { error: workloadError } = await supabase
      .from('staff')
      .update({ workload: staffMember.workload + 1 })
      .eq('user_id', staffMember.user_id);

    if (workloadError) {
      console.error('Failed to update staff workload:', workloadError);
      
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

  async update(pickupId: string, userId: string, dto: UpdatePickupDto) {
    const supabase = this.supabaseService.getClient();

    const { data: pickup, error: findError } = await supabase
      .from('pickup_requests')
      .select('id, status, user_id')
      .eq('id', pickupId)
      .single();

    if (findError || !pickup) throw new NotFoundException('Pickup not found');
    if (pickup.user_id !== userId) throw new ForbiddenException('Not your pickup request');
    if (pickup.status !== 'pending') throw new ForbiddenException('Only pending pickups can be updated');

    const updateData: Record<string, unknown> = {
      waste_type: dto.waste_type,
      volume_kg: dto.volume_kg,
      pickup_address: dto.pickup_address,
      pickup_lat: dto.pickup_lat,
      pickup_lng: dto.pickup_lng,
      special_instructions: dto.special_instructions,
    };

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) delete updateData[key];
    });

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No fields to update');
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('pickup_requests')
      .update(updateData)
      .eq('id', pickupId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new ForbiddenException('Failed to update pickup request');

    return { message: 'Pickup request updated', pickup: data };
  }

  async remove(pickupId: string, userId: string) {
    const supabase = this.supabaseService.getClient();

    const { data: pickup, error: findError } = await supabase
      .from('pickup_requests')
      .select('id, status, user_id, assigned_staff_id')
      .eq('id', pickupId)
      .single();

    if (findError || !pickup) throw new NotFoundException('Pickup not found');
    if (pickup.user_id !== userId) throw new ForbiddenException('Not your pickup request');
    if (pickup.status !== 'pending') throw new ForbiddenException('Only pending pickups can be deleted');

    const { error } = await supabase
      .from('pickup_requests')
      .delete()
      .eq('id', pickupId)
      .eq('user_id', userId);

    if (error) throw new ForbiddenException('Failed to delete pickup request');

    if (pickup.assigned_staff_id) {
      try {
        await supabase.rpc('decrement_staff_workload', { staff_id: pickup.assigned_staff_id });
      } catch (err) {
        console.error('Failed to decrement staff workload:', err);
      }
    }

    return { message: 'Pickup request deleted' };
  }

  async getProfile(userId: string) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('customers')
      .select('reward_points')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Customer profile not found');
    }
    return data;
  }
}


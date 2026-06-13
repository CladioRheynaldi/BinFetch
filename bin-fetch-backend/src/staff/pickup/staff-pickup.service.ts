
import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CompletePickupDto } from './dto/complete-pickup.dto';

@Injectable()
export class StaffPickupService {
  constructor(private supabaseService: SupabaseService) {}

  async findAllPending() {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('pickup_requests')
      .select('*, customers:user_id(reward_points)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) throw new NotFoundException('Could not fetch pickups');
    return data;
  }

  async accept(pickupId: string, staffUserId: string) {
    const supabase = this.supabaseService.getClient();

    const { data: pickup, error: findError } = await supabase
      .from('pickup_requests')
      .select('id, status, assigned_staff_id')
      .eq('id', pickupId)
      .single();

    if (findError || !pickup) throw new NotFoundException('Pickup not found');
    
    
    if (['accepted', 'processing', 'completed'].includes(pickup.status.toLowerCase()) && pickup.assigned_staff_id === staffUserId) {
      return { message: 'Pickup accepted', pickup };
    }

    if (pickup.status.toLowerCase() !== 'pending') throw new ForbiddenException('Pickup cannot be accepted');

    const { data, error } = await supabase
      .from('pickup_requests')
      .update({ status: 'accepted', assigned_staff_id: staffUserId, updated_at: new Date() })
      .eq('id', pickupId)
      .select()
      .single();

    if (error) throw new ForbiddenException('Failed to accept pickup');
    return { message: 'Pickup accepted', pickup: data };
  }

  async complete(pickupId: string, staffUserId: string, dto: CompletePickupDto) {
    const supabase = this.supabaseService.getClient();

    
    const { data: pickup, error: findError } = await supabase
      .from('pickup_requests')
      .select('id, status, assigned_staff_id, user_id')
      .eq('id', pickupId)
      .single();

    if (findError || !pickup) {
      console.error('Find Error in complete pickup:', findError);
      throw new NotFoundException(`Pickup not found: ${findError?.message || 'No record found'}`);
    }
    
    if (pickup.status !== 'processing') {
      console.warn(`Pickup status is not processing: ${pickup.status}`);
      throw new ForbiddenException(`Pickup must be in processing state to complete (current status is: ${pickup.status})`);
    }
    
    if (pickup.assigned_staff_id !== staffUserId) {
      console.warn(`Staff user ID mismatch: ${pickup.assigned_staff_id} !== ${staffUserId}`);
      throw new ForbiddenException('Not assigned to you');
    }

    
    let pointsToAward: number;
    if (dto.manual_points !== undefined) {
      pointsToAward = dto.manual_points;
    } else {
      pointsToAward = dto.actual_volume_kg * 10; 
    }

    
    const { data: updatedPickup, error: updateError } = await supabase
      .from('pickup_requests')
      .update({
        status: 'completed',
        updated_at: new Date(),
        actual_waste_type: dto.actual_waste_type,
        actual_volume_kg: dto.actual_volume_kg,
        points_awarded: pointsToAward,
      })
      .eq('id', pickupId)
      .select()
      .single();

    if (updateError) {
      console.error('Update Error in complete pickup:', updateError);
      throw new ForbiddenException(`Failed to complete pickup bangsat: ${updateError.message}`);
    }

    
    try {
      await supabase.rpc('decrement_staff_workload', { staff_id: staffUserId });
    } catch (err) {
      console.error('Failed to decrement staff workload:', err);
    }
    
    
    const { error: pointsError } = await supabase.rpc('add_reward_points', {
      p_user_id: pickup.user_id,
      p_points: pointsToAward,
    });
    if (pointsError) {
      console.error('Failed to award points RPC:', pointsError);
    }

    return {
      message: `Pickup completed. ${pointsToAward} points awarded to customer.`,
      pickup: updatedPickup,
    };
  }

  async getAssignedPickups(staffUserId: string) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('pickup_requests')
      .select('*')
      .eq('assigned_staff_id', staffUserId)
      .order('created_at', { ascending: false });

    if (error) throw new NotFoundException('Could not fetch assigned pickups');
    return data;
  }

  
  async cancel(pickupId: string, staffUserId: string) {
    const supabase = this.supabaseService.getClient();

    
    const { data: pickup, error: findError } = await supabase
      .from('pickup_requests')
      .select('id, status, assigned_staff_id, user_id')
      .eq('id', pickupId)
      .single();

    if (findError || !pickup) throw new NotFoundException('Pickup not found');
    if (pickup.status === 'completed') throw new ForbiddenException('Cannot cancel completed pickup');
    if (pickup.assigned_staff_id !== staffUserId) throw new ForbiddenException('Pickup not assigned to you');

    
    await supabase.rpc('decrement_staff_workload', { staff_id: staffUserId });

    
    const { data: nextStaff, error: staffError } = await supabase
      .from('staff')
      .select('user_id, workload')
      .neq('user_id', staffUserId)
      .order('workload', { ascending: true })
      .limit(1)
      .single();

    let newAssignedStaffId = null;
    if (!staffError && nextStaff) {
      newAssignedStaffId = nextStaff.user_id;
      
      await supabase
        .from('staff')
        .update({ workload: nextStaff.workload + 1 })
        .eq('user_id', newAssignedStaffId);
    }

    
    const updateData: any = {
      status: 'pending',
      updated_at: new Date(),
      assigned_staff_id: newAssignedStaffId,
    };

    const { data: updatedPickup, error: updateError } = await supabase
      .from('pickup_requests')
      .update(updateData)
      .eq('id', pickupId)
      .select()
      .single();

    if (updateError) throw new ForbiddenException('Failed to cancel pickup');

    return {
      message: newAssignedStaffId
        ? 'Pickup cancelled and reassigned to another staff member'
        : 'Pickup cancelled. No other staff available - pickup is now unassigned.',
      pickup: updatedPickup,
    };
  }
  
  async process(pickupId: string, staffUserId: string) {
    const supabase = this.supabaseService.getClient();

    const { data: pickup, error: findError } = await supabase
      .from('pickup_requests')
      .select('id, status, assigned_staff_id')
      .eq('id', pickupId)
      .single();

    if (findError || !pickup) throw new NotFoundException('Pickup not found');
    
    
    if (['processing', 'completed'].includes(pickup.status.toLowerCase()) && pickup.assigned_staff_id === staffUserId) {
      return { message: 'Pickup is now being processed', pickup };
    }

    if (pickup.status.toLowerCase() !== 'accepted') throw new ForbiddenException('Pickup must be accepted first');
    if (pickup.assigned_staff_id !== staffUserId) throw new ForbiddenException('Not assigned to you');

    const { data, error } = await supabase
      .from('pickup_requests')
      .update({ status: 'processing', updated_at: new Date() })
      .eq('id', pickupId)
      .select()
      .single();

    if (error) throw new ForbiddenException('Failed to mark pickup as processing');

    return { message: 'Pickup is now being processed', pickup: data };
  }
}
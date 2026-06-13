import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ChatService {
  constructor(private supabaseService: SupabaseService) {}

  async getMessages(pickupRequestId: string, userId: string) {
    const supabase = this.supabaseService.getClient();

    
    const { data: pickup, error: findError } = await supabase
      .from('pickup_requests')
      .select('id, user_id, assigned_staff_id')
      .eq('id', pickupRequestId)
      .single();

    if (findError || !pickup) throw new NotFoundException('Pickup request not found');

    if (pickup.user_id !== userId && pickup.assigned_staff_id !== userId) {
      throw new ForbiddenException('You are not authorized to view this chat room');
    }

    
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('pickup_request_id', pickupRequestId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to fetch chat messages:', error);
      throw new NotFoundException('Could not fetch chat messages');
    }

    
    let customerName = 'Customer';
    let staffName = 'Staff Member';

    if (pickup.user_id) {
      const { data: customerData } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', pickup.user_id)
        .single();
      if (customerData?.full_name) customerName = customerData.full_name;
    }

    if (pickup.assigned_staff_id) {
      const { data: staffData } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', pickup.assigned_staff_id)
        .single();
      if (staffData?.full_name) staffName = staffData.full_name;
    }

    return {
      messages,
      customerName,
      staffName,
    };
  }

  async postMessage(pickupRequestId: string, senderId: string, dto: CreateMessageDto) {
    const supabase = this.supabaseService.getClient();

    
    const { data: pickup, error: findError } = await supabase
      .from('pickup_requests')
      .select('id, user_id, assigned_staff_id')
      .eq('id', pickupRequestId)
      .single();

    if (findError || !pickup) throw new NotFoundException('Pickup request not found');

    if (pickup.user_id !== senderId && pickup.assigned_staff_id !== senderId) {
      throw new ForbiddenException('You are not authorized to send messages to this chat room');
    }

    
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', senderId)
      .single();

    const senderName = userError || !user ? 'BinFetch Member' : user.full_name;

    
    const { data: message, error: insertError } = await supabase
      .from('chat_messages')
      .insert({
        pickup_request_id: pickupRequestId,
        sender_id: senderId,
        sender_name: senderName,
        message: dto.message,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to insert chat message:', insertError);
      throw new ForbiddenException('Failed to send message: ' + insertError.message);
    }

    return message;
  }
}

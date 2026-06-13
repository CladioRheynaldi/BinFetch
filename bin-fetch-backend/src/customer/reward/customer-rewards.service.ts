import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class CustomerRewardsService {
  constructor(private supabaseService: SupabaseService) {}

  
  async getAvailableItems() {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('reward_items')
      .select('*')
      .eq('is_active', true)
      .gt('stock_quantity', 0) 
      .order('points_cost', { ascending: true });

    if (error) throw new NotFoundException('Could not fetch reward items');
    return data;
  }

  
  async getRedemptionHistory(customerId: string) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('redemptions')
      .select(`
        id,
        points_spent,
        status,
        notes,
        created_at,
        reward_items (id, name, image_url)
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw new NotFoundException('Could not fetch redemption history');
    return data;
  }

  
  async redeemItem(customerId: string, itemId: string) {
    const supabase = this.supabaseService.getClient();

    
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('reward_points')
      .eq('user_id', customerId)
      .single();

    if (customerError || !customer) {
      throw new NotFoundException('Customer not found');
    }

    
    const { data: item, error: itemError } = await supabase
      .from('reward_items')
      .select('*')
      .eq('id', itemId)
      .eq('is_active', true)
      .single();

    if (itemError || !item) {
      throw new NotFoundException('Reward item not available');
    }

    if (item.stock_quantity <= 0) {
      throw new BadRequestException('Item is out of stock');
    }

    if (customer.reward_points < item.points_cost) {
      throw new BadRequestException('Insufficient points');
    }

    
    

    
    const { error: pointsError } = await supabase
      .from('customers')
      .update({ reward_points: customer.reward_points - item.points_cost })
      .eq('user_id', customerId);

    if (pointsError) throw new ForbiddenException('Failed to deduct points');

    
    const { error: stockError } = await supabase
      .from('reward_items')
      .update({ stock_quantity: item.stock_quantity - 1 })
      .eq('id', itemId);

    if (stockError) {
      
      await supabase
        .from('customers')
        .update({ reward_points: customer.reward_points })
        .eq('user_id', customerId);
      throw new ForbiddenException('Failed to update stock');
    }

    
    const { data: redemption, error: redemptionError } = await supabase
      .from('redemptions')
      .insert({
        customer_id: customerId,
        item_id: itemId,
        points_spent: item.points_cost,
        status: 'pending',
      })
      .select()
      .single();

    if (redemptionError) {
      
      await supabase
        .from('customers')
        .update({ reward_points: customer.reward_points })
        .eq('user_id', customerId);
      await supabase
        .from('reward_items')
        .update({ stock_quantity: item.stock_quantity })
        .eq('id', itemId);
      throw new ForbiddenException('Failed to create redemption record');
    }

    return {
      message: 'Item redeemed successfully',
      redemption: redemption,
      remaining_points: customer.reward_points - item.points_cost,
    };
  }
}
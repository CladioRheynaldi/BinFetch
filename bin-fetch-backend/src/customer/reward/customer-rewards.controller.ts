import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { CustomerRewardsService } from './customer-rewards.service';
import { RedeemItemDto } from './dto/redeem-item.dto';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('customer/rewards')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('customer')
export class CustomerRewardsController {
  constructor(private readonly rewardsService: CustomerRewardsService) {}

  @Get('items')
  async getAvailableItems() {
    return this.rewardsService.getAvailableItems();
  }

  @Get('history')
  async getRedemptionHistory(@Request() req) {
    return this.rewardsService.getRedemptionHistory(req.user.userId);
  }

  @Post('redeem')
  async redeemItem(@Request() req, @Body() dto: RedeemItemDto) {
    return this.rewardsService.redeemItem(req.user.userId, dto.item_id);
  }
}
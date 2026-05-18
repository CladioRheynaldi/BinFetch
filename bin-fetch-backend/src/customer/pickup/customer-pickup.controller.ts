import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { CustomerPickupService } from './customer-pickup.service';
import { CreatePickupDto } from './dto/create-pickup.dto';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('customer/pickup')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('customer')
export class CustomerPickupController {
  constructor(private readonly pickupService: CustomerPickupService) {}

  @Post()
  create(@Request() req, @Body() dto: CreatePickupDto) {
    return this.pickupService.create(req.user.userId, dto);
  }

  @Get('my-requests')
  getMyRequests(@Request() req) {
    return this.pickupService.findByUser(req.user.userId);
  }
}


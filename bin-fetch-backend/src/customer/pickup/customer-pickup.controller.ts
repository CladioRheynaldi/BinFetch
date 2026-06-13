import { Controller, Post, Get, Body, UseGuards, Request, Patch, Param, Delete } from '@nestjs/common';
import { CustomerPickupService } from './customer-pickup.service';
import { CreatePickupDto } from './dto/create-pickup.dto';
import { UpdatePickupDto } from './dto/update-pickup.dto';
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

  @Get('profile')
  getProfile(@Request() req) {
    return this.pickupService.getProfile(req.user.userId);
  }

  @Get('my-requests')
  getMyRequests(@Request() req) {
    return this.pickupService.findByUser(req.user.userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Request() req, @Body() dto: UpdatePickupDto) {
    return this.pickupService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.pickupService.remove(id, req.user.userId);
  }
}


// src/staff/pickup/staff-pickup.controller.ts
import { Controller, Get, Patch, Param, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { StaffPickupService } from './staff-pickup.service';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Body } from '@nestjs/common';
import { CompletePickupDto } from './dto/complete-pickup.dto';

@Controller('staff/pickup')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('staff')
export class StaffPickupController {
  constructor(private readonly staffPickupService: StaffPickupService) {}

  @Get()
  getAllPending() {
    return this.staffPickupService.findAllPending();
  }

  @Patch(':id/accept')
  @HttpCode(HttpStatus.OK)
  accept(@Param('id') id: string, @Request() req) {
    return this.staffPickupService.accept(id, req.user.userId);
  }

@Patch(':id/complete')
@HttpCode(HttpStatus.OK)
async complete(
  @Param('id') id: string,
  @Request() req,
  @Body() dto: CompletePickupDto,
) {
  return this.staffPickupService.complete(id, req.user.userId, dto);
}
  @Get('assigned')
  getAssigned(@Request() req) {
    return this.staffPickupService.getAssignedPickups(req.user.userId);
  }

  // ✅ NEW: Cancel endpoint
  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  cancel(@Param('id') id: string, @Request() req) {
    return this.staffPickupService.cancel(id, req.user.userId);
  }

  @Patch(':id/process')
  @HttpCode(HttpStatus.OK)
  async process(@Param('id') id: string, @Request() req) {
    return this.staffPickupService.process(id, req.user.userId);
  }
}


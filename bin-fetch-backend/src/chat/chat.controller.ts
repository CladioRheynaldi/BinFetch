import { Controller, Get, Post, Body, Param, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../common/guards/auth.guard';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get(':pickupRequestId')
  getMessages(@Param('pickupRequestId') pickupRequestId: string, @Request() req) {
    return this.chatService.getMessages(pickupRequestId, req.user.userId);
  }

  @Post(':pickupRequestId')
  @HttpCode(HttpStatus.CREATED)
  postMessage(
    @Param('pickupRequestId') pickupRequestId: string,
    @Request() req,
    @Body() dto: CreateMessageDto,
  ) {
    return this.chatService.postMessage(pickupRequestId, req.user.userId, dto);
  }
}

import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../../common/guards/jwt-guard.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('messages/:receiverId')
  async getMessages(@Request() req, @Param('receiverId') receiverId: string) {
    return this.chatService.getMessages(req.user.id, receiverId);
  }

  @Get('conversations')
  async getConversations(@Request() req) {
    return this.chatService.getMyConversations(req.user.id);
  }
}

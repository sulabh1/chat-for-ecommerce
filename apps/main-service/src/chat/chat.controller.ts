/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../guards/jwt.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}
  @Get('chats')
  async getUserChats(@Request() req) {
    return await this.chatService.getUserChats(req.user.id);
  }

  @Post('start')
  async startChat(
    @Body()
    body: {
      sellerId: string;
      productId: string;
      sellerName: string;
      productName: string;
      productImage?: string;
    },
    @Request() req,
  ) {
    return await this.chatService.getOrCreateChat({
      buyerId: req.user.id,
      buyerName: req.user.name,
      sellerId: body.sellerId,
      sellerName: body.sellerName,
      productId: body.productId,
      productName: body.productName,
      productImage: body.productImage,
    });
  }

  @Get(':id')
  async getChat(@Param('id') chatId: string) {
    return await this.chatService.getChat(chatId);
  }

  @Get(':id/messages')
  async getChatMessages(@Param('id') chatId: string) {
    return await this.chatService.getChatMessages(chatId);
  }

  @Post(':id/read')
  async markAsRead(@Param('id') chatId: string, @Request() req) {
    return this.chatService.markAsRead(chatId, req.user.id);
    return { success: true };
  }
}

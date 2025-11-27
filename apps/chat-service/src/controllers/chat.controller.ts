/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { ChatService } from '../services/chat.service';
import { MessageService } from '../services/message.service';
import { PresenceService } from '../services/presence.service';

@Controller()
export class ChatController {
  constructor(
    private chatService: ChatService,
    private messageService: MessageService,
    private presenceService: PresenceService,
  ) {}

  @MessagePattern('chat.get_or_create')
  async getOrCreateChats(@Payload() data: any) {
    return await this.chatService.getOrCreateChat(data);
  }

  @MessagePattern('chat.get_user_chats')
  async getUserChats(@Payload() userId: string) {
    return await this.chatService.getUserChat(userId);
  }

  @MessagePattern('chat.get_chat')
  async getChat(@Payload() chatId: string) {
    return await this.chatService.getChat(chatId);
  }

  @EventPattern('chat.message.created')
  async handleMessageCreated(@Payload() data: any) {
    const message = await this.messageService.createMessage(data);
    return message;
  }

  @MessagePattern('chat.get_message')
  async getChatMessage(@Payload() chatId: string) {
    return await this.messageService.getChatMessages(chatId);
  }

  @MessagePattern('chat.mark_as_read')
  async markMessagesAsRead(@Payload() data: { messageIds: string[] }) {
    await this.messageService.markMessagesAsRead(data.messageIds);
  }

  @MessagePattern('chat.mark_chat_as_read')
  async markChatAsRead(@Payload() data: { chatId: string; userId: string }) {
    await this.messageService.markChatAsRead(data.chatId, data.userId);
  }

  @MessagePattern('presence.user_connected')
  async handleUserConnected(
    @Payload() data: { userId: string; socketId: string },
  ) {
    await this.presenceService.userConnected(data.userId, data.socketId);
  }

  @MessagePattern('presence.user_disconnected')
  async handleUserDisconnected(@Payload() data: { socketId: string }) {
    await this.presenceService.userDisconnected(data.socketId);
  }

  @MessagePattern('presence.is_online')
  async isUserOnline(@Payload() userId: string) {
    return await this.presenceService.isUserOnline(userId);
  }

  @MessagePattern('presence.get_online_users')
  async getOnlineUsers() {
    return await this.presenceService.getOnlineUsers();
  }
}

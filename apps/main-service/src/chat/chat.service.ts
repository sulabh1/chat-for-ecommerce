/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/require-await */
import { Injectable, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class ChatService {
  constructor(
    @Inject('CHAT_SERVICE') private readonly chatClient: ClientKafka,
  ) {}
  async getOrCreateChat(data: any) {
    return this.chatClient.send('chat.get_or_create', data);
  }
  async getUserChats(userId: string) {
    return this.chatClient.send('chat.get_user_chats', userId);
  }
  async getChat(chatId: string) {
    return this.chatClient.send('chat.get_chat', chatId);
  }

  async getChatMessages(chatId: string) {
    return this.chatClient.send('chat.get_message', chatId);
  }
  async markAsRead(chatId: string, userId: string, messageIds?: string[]) {
    if (messageIds && messageIds.length > 0) {
      await this.chatClient.send('chat.mark_as_read', { messageIds });
    }
    await this.chatClient.send('chat.mark_chat_as_read', { chatId, userId });
  }
}

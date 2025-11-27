/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from '../entities/message.entity';
import { ChatService } from './chat.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message) private messageRepository: Repository<Message>,
    private chatService: ChatService,
  ) {}
  async createMessage(data: {
    chatId: string;
    senderId: string;
    content: string;
    senderName: string;
    messageType?: string;
    fileUrl?: string;
  }): Promise<Message> {
    const message = this.messageRepository.create({
      chatId: data.chatId,
      senderId: data.senderId,
      senderName: data.senderName,
      content: data.content,
      messageType: data.messageType || 'text',
      fileUrl: data.fileUrl,
    });
    const savedMessage = await this.messageRepository.save(message);
    await this.chatService.updateLastMessage(data.chatId, data.content);
    return savedMessage;
  }
  async getChatMessages(chatId: string): Promise<Message[]> {
    return await this.messageRepository.find({
      where: { chat: { id: chatId } },
      order: { createdAt: 'ASC' },
    });
  }

  async markMessagesAsRead(messageIds: string[]): Promise<void> {
    await this.messageRepository.update(messageIds, {
      read: true,
      readAt: new Date(),
    });
  }
  async markChatAsRead(chatId: string, userId: string): Promise<void> {
    await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ read: true, readAt: new Date() })
      .where('chatId = :chatId AND senderId !=:userId', { chatId, userId })
      .execute();
  }
  async getUnreadCount(chatId: string, userId: string): Promise<number> {
    return await this.messageRepository.count({
      where: {
        chatId,
        senderId: userId,
        read: false,
      },
    });
  }
}

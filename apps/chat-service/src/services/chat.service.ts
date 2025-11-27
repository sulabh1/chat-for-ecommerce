import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from '../entities/chat.entity';
@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat) private chatRepository: Repository<Chat>,
  ) {}
  async getOrCreateChat(data: {
    buyerId: string;
    sellerId: string;
    productId: string;
    buyerName: string;
    sellerName: string;
    productName: string;
    productImage?: string;
  }) {
    let chat = await this.chatRepository.findOne({
      where: {
        buyerId: data.buyerId,
        sellerId: data.sellerId,
        productId: data.productId,
      },
      relations: ['messages'],
    });
    if (!chat) {
      chat = this.chatRepository.create(data);
      chat = await this.chatRepository.save(chat);
    }
    return chat;
  }

  async getUserChat(userId: string): Promise<Chat[]> {
    return await this.chatRepository.find({
      where: [
        {
          buyerId: userId,
        },
        {
          sellerId: userId,
        },
      ],
      order: { updatedAt: 'DESC' },
    });
  }

  async getChat(chatId: string): Promise<Chat> {
    const chat = await this.chatRepository.findOne({
      where: {
        id: chatId,
      },
      relations: ['messages'],
    });
    if (!chat) {
      throw new NotFoundException(`Chat with ID ${chatId} not found`);
    }
    return chat;
  }

  async updateLastMessage(chatId: string, lastMessage: string): Promise<void> {
    await this.chatRepository.update(chatId, {
      lastMessage,
      lastMessageAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

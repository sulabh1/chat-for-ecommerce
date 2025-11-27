/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ChatGateway } from '../chat/chat.gateway';

@Injectable()
export class KafkaConsumerService implements OnModuleInit {
  constructor(private chatGateway: ChatGateway) {}
  async onModuleInit() {}
  async handleMessageSent(message: any) {
    this.chatGateway.broadcastToChat(message.chatId, 'new_message', message);
  }
}

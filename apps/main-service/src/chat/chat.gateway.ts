/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { KafkaProducerService } from '../kafka/kafka-producer.service';
@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('ChatGateway');
  private connectedUsers = new Map<string, string>();
  constructor(private kafkaProducer: KafkaProducerService) {}

  async handleConnection(client: Socket) {
    try {
      const userId = client.handshake.auth.userId;
      if (!userId) {
        client.disconnect();
        return;
      }
      this.connectedUsers.set(userId, client.id);
      this.logger.log(`User ${userId} connected`);
      await this.kafkaProducer.send('presence.user_connected', {
        userId,
        socketId: client.id,
      });

      this.server.emit('user_online', { userId });
    } catch (err) {
      this.logger.error('Connection error:', err);
      client.disconnect();
    }
  }
  async handleDisconnect(client: Socket) {
    try {
      for (const [userId, socketId] of this.connectedUsers.entries()) {
        if (socketId === client.id) {
          this.connectedUsers.delete(userId);
          this.logger.log(`User ${userId} disconnected`);

          await this.kafkaProducer.send('presence.user_disconnected', {
            socketId: client.id,
          });
          this.server.emit('user_offline', { userId });
          break;
        }
      }
    } catch (err) {
      this.logger.error('Disconnection error', err);
    }
  }

  @SubscribeMessage('join_chat')
  handleJoinChat(client: Socket, chatId: string) {
    client.join(`chat_${chatId}`);
    this.logger.log(`User joined chat:${chatId}`);
  }

  @SubscribeMessage('leave_chat')
  handleLeaveChat(client: Socket, chatId: string) {
    client.leave(`chat_${chatId}`);
    this.logger.log(`User left chat: ${chatId}`);
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    client: Socket,
    payload: {
      chatId: string;
      content: string;
      senderId: string;
      senderName: string;
      messageType?: string;
      fileUrl?: string;
    },
  ) {
    try {
      await this.kafkaProducer.emit('chat.message.created', payload);
      //   this.server.to(`chat_${payload.chatId}`).emit('new_message', {
      //     ...payload,
      //     id: Date.now().toString(),
      //     createAt: new Date(),
      //   });

      client.emit('message_acknowledged', {
        chatId: payload.chatId,
        tempId: payload['tempId'],
      });
    } catch (err) {
      this.logger.error('Error sending message:', err);
      client.emit('message_error', {
        error: 'Failed to send message',
        tempId: payload['tempId'],
      });
    }
  }
  @SubscribeMessage('typing_start')
  async handleTypingStart(
    client: Socket,
    payload: { chatId: string; userId: string; userName: string },
  ) {
    client.to(`chat_${payload.chatId}`).emit('user_typing', {
      userId: payload.userId,
      userName: payload.userName,
      typing: true,
    });
  }
  @SubscribeMessage('typing_stop')
  async handleTypingStop(
    client: Socket,
    payload: { chatId: string; userId: string },
  ) {
    client
      .to(`chat_${payload.chatId}`)
      .emit('user_typing', { userId: payload.userId, typing: false });
  }
  @SubscribeMessage('mark_as_read')
  async handleMarkAsRead(
    client: Socket,
    payload: {
      chatId: string;
      messageIds: string[];
      userId: string;
    },
  ) {
    try {
      await this.kafkaProducer.send('chat.mark_as_read', {
        messageIds: payload.messageIds,
      });
      await this.kafkaProducer.send('chat.mark_chat_as_read', {
        chatId: payload.chatId,
        userId: payload.userId,
      });
    } catch (err) {
      this.logger.error('Error marking as read', err);
    }
  }
  broadcastToChat(chatId: string, event: string, data: any) {
    this.server.to(`chat_${chatId}`).emit(event, data);
  }
  sendToUser(userId: string, event: string, data: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }
  isUserConnecteed(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}

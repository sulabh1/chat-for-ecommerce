/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
// apps/chat-service/src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatDataSource } from './config/typeorm.config';
import { Message } from './entities/message.entity';
import { OnlineUser } from './entities/online-user.entity';
import { ChatService } from './services/chat.service';
import { MessageService } from './services/message.service';
import { PresenceService } from './services/presence.service';
import { ChatController } from './controllers/chat.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        ChatDataSource.options as unknown as any,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Chat, Message, OnlineUser]),
  ],
  controllers: [ChatController],
  providers: [ChatService, MessageService, PresenceService],
})
export class AppModule {}

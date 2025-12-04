/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// apps/chat-service/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { KAFKA_GROUPS } from './config/kafka.config';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.KAFKA,

    options: {
      client: {
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: KAFKA_GROUPS.CHAT_SERVICE,
      },
    },
  });

  await app.listen();
  console.log('Chat microservice is listening');
}
bootstrap();

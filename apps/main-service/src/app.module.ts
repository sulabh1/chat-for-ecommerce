/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
// apps/main-service/src/app.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MainDataSource } from './config/typeorm.config';
import { ChatGateway } from './chat/chat.gateway';
// import { ChatController } from './chat/chat.controller';
// import { ChatService } from './chat/chat.service';
// import { KafkaConsumerService } from './kafka/kafka-consumer.service';
// import { KafkaProducerService } from './kafka/kafka-producer.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'CHAT_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
          },
          consumer: {
            groupId: 'main-service',
          },
        },
      },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        MainDataSource.options as unknown as any,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([]),
  ],
  //controllers: [ChatController],
  providers: [
    // ChatGateway,
    // ChatService,
    //  KafkaProducerService,
    // KafkaConsumerService,
  ],
})
export class AppModule {}

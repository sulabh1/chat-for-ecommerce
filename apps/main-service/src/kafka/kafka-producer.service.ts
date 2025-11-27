/* eslint-disable @typescript-eslint/require-await */
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly kafkaClient: ClientKafka) {}
  async onModuleInit() {
    await this.kafkaClient.connect();
  }
  async emit(pattern: string, data: any) {
    this.kafkaClient.emit(pattern, data);
  }
  async send(pattern: string, data: any) {
    return this.kafkaClient.send(pattern, data);
  }
  async onModuleDestroy() {
    await this.kafkaClient.close();
  }
}

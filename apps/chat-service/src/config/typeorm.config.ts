/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// apps/chat-service/src/config/typeorm.config.ts
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

export const ChatDataSource = new DataSource({
  type: 'postgres',
  host: process.env.CHAT_DB_HOST || process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.CHAT_DB_PORT || process.env.DB_PORT || '5432'),
  username:
    process.env.CHAT_DB_USERNAME || process.env.DB_USERNAME || 'postgres',
  password:
    process.env.CHAT_DB_PASSWORD || process.env.DB_PASSWORD || 'password',
  database: process.env.CHAT_DB_NAME || process.env.DB_DATABASE || 'chat-app',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  synchronize: false,
  migrationsRun: false, // Set to false, run manually
  logging: !isProduction,
  namingStrategy: new SnakeNamingStrategy(),
  ssl: isProduction,
  extra: isProduction
    ? {
        ssl: {
          rejectUnauthorized: false,
        },
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 30000,
      }
    : {},
});

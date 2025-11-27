// apps/main-service/src/config/typeorm.config.ts
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

export const MainDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'ecommerce',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  synchronize: false,
  migrationsRun: false,
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

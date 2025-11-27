/* eslint-disable @typescript-eslint/no-unsafe-return */
// apps/chat-service/src/entities/chat.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Message } from './message.entity';

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'buyer_id' })
  buyerId: string;

  @Column({ name: 'seller_id' })
  sellerId: string;

  @Column({ name: 'product_id' })
  productId: string;

  @Column({ name: 'buyer_name' })
  buyerName: string;

  @Column({ name: 'seller_name' })
  sellerName: string;

  @Column({ name: 'product_name' })
  productName: string;

  @Column({ name: 'product_image', nullable: true })
  productImage: string;

  @Column({ name: 'last_message', type: 'text', nullable: true })
  lastMessage: string;

  @Column({ name: 'last_message_at', nullable: true })
  lastMessageAt: Date;

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

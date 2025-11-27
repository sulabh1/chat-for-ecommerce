import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('online_users')
export class OnlineUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'socket_id' })
  socketId: string;

  @Column({ name: 'is_online', default: true })
  isOnline: boolean;

  @Column({ name: 'last_seen' })
  lastSeen: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

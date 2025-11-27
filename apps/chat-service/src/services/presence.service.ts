/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnlineUser } from '../entities/online-user.entity';

@Injectable()
export class PresenceService {
  constructor(
    @InjectRepository(OnlineUser)
    private onlineUserRepository: Repository<OnlineUser>,
  ) {}

  async userConnected(userId: string, socketId: string): Promise<void> {
    await this.onlineUserRepository.delete({ userId });
    const onlineUser = this.onlineUserRepository.create({
      userId,
      socketId,
      isOnline: true,
      lastSeen: new Date(),
    } as any);
    await this.onlineUserRepository.save(onlineUser);
  }
  async userDisconnected(socketId: string): Promise<void> {
    await this.onlineUserRepository.update(
      { socketId },
      { isOnline: false, lastSeen: new Date() },
    );
  }
  async isUserOnline(userId: string): Promise<boolean> {
    const user = await this.onlineUserRepository.findOne({
      where: { userId, isOnline: true },
    });
    return !!user;
  }
  async getUserSocketId(userId: string): Promise<string | null> {
    const user = await this.onlineUserRepository.findOne({
      where: { userId, isOnline: true },
    });
    return user?.socketId || null;
  }
  async getOnlineUsers(): Promise<string[]> {
    const users = await this.onlineUserRepository.find({
      where: { isOnline: true },
    });
    return users.map((user) => user.userId);
  }
}

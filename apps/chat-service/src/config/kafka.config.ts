import { Kafka, logLevel } from 'kafkajs';

export const kafka = new Kafka({
  clientId: 'chat-service',
  brokers: ['localhost:9092'],
  logLevel: logLevel.ERROR,
});

export const KAFKA_TOPICS = {
  // Chat topics
  CHAT_MESSAGE_CREATED: 'chat.message.created',
  CHAT_MESSAGE_SENT: 'chat.message.sent',
  CHAT_CREATED: 'chat.created',
  CHAT_UPDATED: 'chat.updated',

  // User presence topics
  USER_ONLINE: 'user.online',
  USER_OFFLINE: 'user.offline',
  USER_TYPING: 'user.typing',

  // Notification topics
  NOTIFICATION_CREATED: 'notification.created',
} as const;

export const KAFKA_GROUPS = {
  CHAT_SERVICE: 'chat-service',
  NOTIFICATION_SERVICE: 'notification-service',
  MAIN_SERVICE: 'main-service',
} as const;

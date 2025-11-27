import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreateChatTables1691234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'chats',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'buyer_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'seller_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'product_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'buyer_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'seller_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'product_name',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'product_image',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'last_message',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'last_message_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Create messages table
    await queryRunner.createTable(
      new Table({
        name: 'messages',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'chat_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'sender_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'sender_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'content',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'message_type',
            type: 'varchar',
            length: '50',
            default: "'text'",
          },
          {
            name: 'file_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'read',
            type: 'boolean',
            default: false,
          },
          {
            name: 'read_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Create online_users table
    await queryRunner.createTable(
      new Table({
        name: 'online_users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'socket_id',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'is_online',
            type: 'boolean',
            default: true,
          },
          {
            name: 'last_seen',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Create foreign key for messages -> chats
    await queryRunner.createForeignKey(
      'messages',
      new TableForeignKey({
        columnNames: ['chat_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'chats',
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes
    await queryRunner.createIndex(
      'chats',
      new TableIndex({
        name: 'IDX_CHATS_BUYER_ID',
        columnNames: ['buyer_id'],
      }),
    );

    await queryRunner.createIndex(
      'chats',
      new TableIndex({
        name: 'IDX_CHATS_SELLER_ID',
        columnNames: ['seller_id'],
      }),
    );

    await queryRunner.createIndex(
      'chats',
      new TableIndex({
        name: 'IDX_CHATS_PRODUCT_ID',
        columnNames: ['product_id'],
      }),
    );

    await queryRunner.createIndex(
      'chats',
      new TableIndex({
        name: 'IDX_CHATS_UPDATED_AT',
        columnNames: ['updated_at'],
      }),
    );

    await queryRunner.createIndex(
      'messages',
      new TableIndex({
        name: 'IDX_MESSAGES_CHAT_ID',
        columnNames: ['chat_id'],
      }),
    );

    await queryRunner.createIndex(
      'messages',
      new TableIndex({
        name: 'IDX_MESSAGES_CREATED_AT',
        columnNames: ['created_at'],
      }),
    );

    await queryRunner.createIndex(
      'messages',
      new TableIndex({
        name: 'IDX_MESSAGES_SENDER_ID',
        columnNames: ['sender_id'],
      }),
    );

    await queryRunner.createIndex(
      'messages',
      new TableIndex({
        name: 'IDX_MESSAGES_READ',
        columnNames: ['read'],
      }),
    );

    await queryRunner.createIndex(
      'online_users',
      new TableIndex({
        name: 'IDX_ONLINE_USERS_USER_ID',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'online_users',
      new TableIndex({
        name: 'IDX_ONLINE_USERS_SOCKET_ID',
        columnNames: ['socket_id'],
      }),
    );

    await queryRunner.createIndex(
      'online_users',
      new TableIndex({
        name: 'IDX_ONLINE_USERS_IS_ONLINE',
        columnNames: ['is_online'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('online_users', 'IDX_ONLINE_USERS_IS_ONLINE');
    await queryRunner.dropIndex('online_users', 'IDX_ONLINE_USERS_SOCKET_ID');
    await queryRunner.dropIndex('online_users', 'IDX_ONLINE_USERS_USER_ID');
    await queryRunner.dropIndex('messages', 'IDX_MESSAGES_READ');
    await queryRunner.dropIndex('messages', 'IDX_MESSAGES_SENDER_ID');
    await queryRunner.dropIndex('messages', 'IDX_MESSAGES_CREATED_AT');
    await queryRunner.dropIndex('messages', 'IDX_MESSAGES_CHAT_ID');
    await queryRunner.dropIndex('chats', 'IDX_CHATS_UPDATED_AT');
    await queryRunner.dropIndex('chats', 'IDX_CHATS_PRODUCT_ID');
    await queryRunner.dropIndex('chats', 'IDX_CHATS_SELLER_ID');
    await queryRunner.dropIndex('chats', 'IDX_CHATS_BUYER_ID');

    // Drop foreign keys
    await queryRunner.dropForeignKey('messages', 'FK_messages_chat_id');

    // Drop tables
    await queryRunner.dropTable('online_users');
    await queryRunner.dropTable('messages');
    await queryRunner.dropTable('chats');
  }
}

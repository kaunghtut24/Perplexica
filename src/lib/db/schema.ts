import { sql } from 'drizzle-orm';
import { text, integer, pgTable, timestamp, jsonb, serial } from 'drizzle-orm/pg-core';

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  chatId: text('chatId').notNull(),
  messageId: text('messageId').notNull(),
  role: text('role', { enum: ['assistant', 'user'] }).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

interface File {
  name: string;
  fileId: string;
}

export const chats = pgTable('chats', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  focusMode: text('focusMode').notNull(),
  files: jsonb('files').$type<File[]>().default(sql`'[]'::jsonb`),
});

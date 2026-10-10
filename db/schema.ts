import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const workspaces=sqliteTable('workspaces',{id:text('id').primaryKey(),ownerId:text('owner_id').notNull(),body:text('body').notNull(),version:integer('version').notNull().default(1)});
export const usage=sqliteTable('usage',{id:text('id').primaryKey(),count:integer('count').notNull().default(0)});

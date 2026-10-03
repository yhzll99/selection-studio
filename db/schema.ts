import { sqliteTable,text,integer,index,primaryKey } from 'drizzle-orm/sqlite-core';
export const records=sqliteTable('research_records',{
 id:text('id').notNull(),owner:text('owner').notNull(),kind:text('kind').notNull(),category:text('category').notNull(),title:text('title').notNull(),data:text('data').notNull(),version:integer('version').notNull().default(1),createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull(),deletedAt:text('deleted_at')
},t=>[primaryKey({columns:[t.owner,t.id]}),index('idx_records_owner_deleted').on(t.owner,t.deletedAt)]);
export const audit=sqliteTable('research_audit',{
 id:text('id').primaryKey(),owner:text('owner').notNull(),recordId:text('record_id').notNull(),action:text('action').notNull(),title:text('title').notNull(),snapshot:text('snapshot').notNull(),createdAt:text('created_at').notNull()
},t=>[index('idx_audit_owner_time').on(t.owner,t.createdAt)]);

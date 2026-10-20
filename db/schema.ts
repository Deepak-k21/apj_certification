// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
export const registrations = sqliteTable('registrations', {
  id: text('id').primaryKey(), reference: text('reference').notNull().unique(),
  sessionHash: text('session_hash').notNull(), requestId: text('request_id').notNull(),
  status: text('status').notNull(), currency: text('currency').notNull(),
  totalMinor: integer('total_minor'), details: text('details').notNull(),
  orderId: text('order_id').unique(), paymentId: text('payment_id'),
  createdAt: text('created_at').notNull(), updatedAt: text('updated_at').notNull()
}, t => [uniqueIndex('registration_request').on(t.sessionHash,t.requestId)]);

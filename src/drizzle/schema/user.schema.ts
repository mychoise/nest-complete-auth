import {
  pgTable,
  text,
  uuid,
  varchar,
  timestamp,
  index,
  pgEnum,
  boolean,
} from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('roles', ['admin', 'user']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('password', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: roleEnum('roles').default('user').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const tokens = pgTable(
  'tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    refresh_token: text('refresh_token').unique().notNull(),
    refresh_token_expiry: timestamp('refresh_token_expiry').notNull(),
    is_revoked: boolean('is_revoked').default(false).notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    user_id: uuid('user_id').references(() => users.id, {
      onDelete: 'cascade',
    }),
  },
  (table) => [index('refresh_token_idx').on(table.refresh_token)],
);

export const otps = pgTable(
  'otps',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    otp_number: varchar('otp_number', { length: 6 }),
    otp_number_expiry_date: timestamp('otp_number_expiry_date'),
    is_used: boolean('is_used').default(false).notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    user_id: uuid('user_id').references(() => users.id, {
      onDelete: 'cascade',
    }),
  },
  (table) => [index('otp_number_idx').on(table.otp_number)],
);

export type User = typeof users.$inferSelect;

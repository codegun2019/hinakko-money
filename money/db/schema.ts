import { sqliteTable, text, real, index } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ─── categories ────────────────────────────────────────────────────────────
export const categories = sqliteTable("categories", {
  id:    text("id").primaryKey(),
  name:  text("name").notNull(),
  icon:  text("icon").notNull(),
  color: text("color").notNull(),
  type:  text("type", { enum: ["income", "expense", "both"] })
           .notNull()
           .default("expense"),
});

// ─── accounts ──────────────────────────────────────────────────────────────
export const accounts = sqliteTable("accounts", {
  id:        text("id").primaryKey(),
  name:      text("name").notNull(),
  balance:   real("balance").notNull().default(0),
  type:      text("type", { enum: ["cash", "bank", "credit"] }).notNull(),
  createdAt: text("created_at").notNull(),
});

// ─── transactions ───────────────────────────────────────────────────────────
export const transactions = sqliteTable(
  "transactions",
  {
    id:              text("id").primaryKey(),
    type:            text("type", { enum: ["income", "expense"] }).notNull(),
    title:           text("title").notNull(),
    amount:          real("amount").notNull(),
    categoryId:      text("category_id")
                       .notNull()
                       .references(() => categories.id),
    paymentMethod:   text("payment_method", {
                       enum: ["cash", "credit", "installment"],
                     }).notNull(),
    transactionDate: text("transaction_date").notNull(), // YYYY-MM-DD
    note:            text("note"),
    createdAt:       text("created_at").notNull(),
    updatedAt:       text("updated_at").notNull(),
  },
  (t) => [
    index("idx_tx_date").on(t.transactionDate),
    index("idx_tx_category").on(t.categoryId),
    index("idx_tx_type").on(t.type),
  ]
);

// ─── relations ──────────────────────────────────────────────────────────────
export const transactionRelations = relations(transactions, ({ one }) => ({
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
}));

export const categoryRelations = relations(categories, ({ many }) => ({
  transactions: many(transactions),
}));

// ─── inferred types ─────────────────────────────────────────────────────────
export type Category    = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Account     = typeof accounts.$inferSelect;
export type NewAccount  = typeof accounts.$inferInsert;
export type Transaction    = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

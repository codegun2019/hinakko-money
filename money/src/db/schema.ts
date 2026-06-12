import { sqliteTable, text, real, integer, index } from "drizzle-orm/sqlite-core";
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
    categoryId:      text("category_id").notNull().references(() => categories.id),
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
    fields:     [transactions.categoryId],
    references: [categories.id],
  }),
}));

export const categoryRelations = relations(categories, ({ many }) => ({
  transactions: many(transactions),
}));

// ─── budgets ────────────────────────────────────────────────────────────────
export const budgets = sqliteTable(
  "budgets",
  {
    id:         text("id").primaryKey(),
    categoryId: text("category_id").notNull().references(() => categories.id),
    month:      text("month").notNull(), // YYYY-MM
    amount:     real("amount").notNull(),
    createdAt:  text("created_at").notNull(),
  },
  (t) => [
    index("idx_budget_month").on(t.month),
    index("idx_budget_cat_month").on(t.categoryId, t.month),
  ],
);

export const budgetRelations = relations(budgets, ({ one }) => ({
  category: one(categories, {
    fields:     [budgets.categoryId],
    references: [categories.id],
  }),
}));

// ─── recurring rules (monthly) ───────────────────────────────────────────────
export const recurringRules = sqliteTable(
  "recurring_rules",
  {
    id:               text("id").primaryKey(),
    type:             text("type", { enum: ["income", "expense"] }).notNull(),
    title:            text("title").notNull(),
    amount:           real("amount").notNull(),
    categoryId:       text("category_id").notNull().references(() => categories.id),
    paymentMethod:    text("payment_method", {
                        enum: ["cash", "credit", "installment"],
                      }).notNull(),
    dayOfMonth:       integer("day_of_month").notNull(),
    note:             text("note"),
    active:           integer("active", { mode: "boolean" }).notNull().default(true),
    lastAppliedMonth: text("last_applied_month"),
    createdAt:        text("created_at").notNull(),
  },
  (t) => [index("idx_recurring_active").on(t.active)],
);

export const recurringRelations = relations(recurringRules, ({ one }) => ({
  category: one(categories, {
    fields:     [recurringRules.categoryId],
    references: [categories.id],
  }),
}));

// ─── inferred types ─────────────────────────────────────────────────────────
export type DbCategory    = typeof categories.$inferSelect;
export type DbAccount     = typeof accounts.$inferSelect;
export type DbTransaction = typeof transactions.$inferSelect;
export type DbBudget       = typeof budgets.$inferSelect;
export type DbRecurringRule = typeof recurringRules.$inferSelect;

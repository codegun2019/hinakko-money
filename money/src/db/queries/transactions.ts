import { createServerFn } from "@tanstack/react-start";
import { eq, like, desc } from "drizzle-orm";
import { db } from "../client";
import { transactions } from "../schema";
import {
  CreateTransactionSchema,
  UpdateTransactionSchema,
  DeleteTransactionSchema,
  ListByMonthSchema,
  GetByIdSchema,
  ImportTransactionsSchema,
} from "~/lib/validation";

export const listTransactionsByMonth = createServerFn({ method: "GET" })
  .inputValidator((raw: unknown) => ListByMonthSchema.parse(raw))
  .handler(async ({ data: { month } }) => {
    return db
      .select()
      .from(transactions)
      .where(like(transactions.transactionDate, `${month}%`))
      .orderBy(desc(transactions.transactionDate), desc(transactions.createdAt));
  });

export const getTransactionById = createServerFn({ method: "GET" })
  .inputValidator((raw: unknown) => GetByIdSchema.parse(raw))
  .handler(async ({ data: { id } }) => {
    const rows = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id))
      .limit(1);
    return rows[0] ?? null;
  });

export const createTransaction = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => CreateTransactionSchema.parse(raw))
  .handler(async ({ data }) => {
    const id  = crypto.randomUUID();
    const now = new Date().toISOString();
    await db.insert(transactions).values({
      id,
      ...data,
      note:      data.note ?? null,
      createdAt: now,
      updatedAt: now,
    });
    return { id };
  });

export const updateTransaction = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => UpdateTransactionSchema.parse(raw))
  .handler(async ({ data: { id, ...updates } }) => {
    await db
      .update(transactions)
      .set({ ...updates, updatedAt: new Date().toISOString() })
      .where(eq(transactions.id, id));
    return { id };
  });

export const deleteTransaction = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => DeleteTransactionSchema.parse(raw))
  .handler(async ({ data: { id } }) => {
    await db.delete(transactions).where(eq(transactions.id, id));
    return { id };
  });

export const listAllTransactions = createServerFn({ method: "GET" })
  .handler(async () => {
    return db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.transactionDate), desc(transactions.createdAt));
  });

export const clearAllTransactions = createServerFn({ method: "POST" })
  .handler(async () => {
    await db.delete(transactions);
    return { ok: true as const };
  });

export const importTransactions = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => ImportTransactionsSchema.parse(raw))
  .handler(async ({ data: { items } }) => {
    const now = new Date().toISOString();
    const rows = items.map((item) => ({
      id: crypto.randomUUID(),
      ...item,
      note:      item.note ?? null,
      createdAt: now,
      updatedAt: now,
    }));
    await db.insert(transactions).values(rows);
    return { imported: rows.length };
  });

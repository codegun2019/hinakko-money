import { createServerFn } from "@tanstack/react-start";
import { and, eq, like } from "drizzle-orm";
import { db } from "../client";
import { budgets, transactions } from "../schema";
import {
  BudgetMonthSchema,
  UpsertBudgetSchema,
  DeleteBudgetSchema,
} from "~/lib/validation";
import { getCategoryById } from "~/lib/constants";
import type { BudgetWithSpent } from "~/lib/types";

export const listBudgetsWithSpent = createServerFn({ method: "GET" })
  .inputValidator((raw: unknown) => BudgetMonthSchema.parse(raw))
  .handler(async ({ data: { month } }): Promise<BudgetWithSpent[]> => {
    const rows = await db.select().from(budgets).where(eq(budgets.month, month));

    const spentRows = await db
      .select({ categoryId: transactions.categoryId, amount: transactions.amount })
      .from(transactions)
      .where(
        and(
          like(transactions.transactionDate, `${month}%`),
          eq(transactions.type, "expense"),
        ),
      );

    const spentMap = new Map<string, number>();
    for (const row of spentRows) {
      spentMap.set(row.categoryId, (spentMap.get(row.categoryId) ?? 0) + row.amount);
    }

    return rows
      .map((b) => ({
        id:         b.id,
        categoryId: b.categoryId,
        month:      b.month,
        amount:     b.amount,
        createdAt:  b.createdAt,
        spent:      spentMap.get(b.categoryId) ?? 0,
        category:   getCategoryById(b.categoryId),
      }))
      .sort((a, b) => b.spent - a.spent);
  });

export const upsertBudget = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => UpsertBudgetSchema.parse(raw))
  .handler(async ({ data: { categoryId, month, amount } }) => {
    const existing = await db
      .select()
      .from(budgets)
      .where(and(eq(budgets.categoryId, categoryId), eq(budgets.month, month)))
      .limit(1);

    if (existing[0]) {
      await db.update(budgets).set({ amount }).where(eq(budgets.id, existing[0].id));
      return { id: existing[0].id };
    }

    const id = crypto.randomUUID();
    await db.insert(budgets).values({
      id,
      categoryId,
      month,
      amount,
      createdAt: new Date().toISOString(),
    });
    return { id };
  });

export const deleteBudget = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => DeleteBudgetSchema.parse(raw))
  .handler(async ({ data: { id } }) => {
    await db.delete(budgets).where(eq(budgets.id, id));
    return { id };
  });

import { createServerFn } from "@tanstack/react-start";
import { like, eq, and } from "drizzle-orm";
import { db } from "../client";
import { transactions } from "../schema";
import { MonthlySummarySchema, CategorySummarySchema } from "~/lib/validation";
import { getCategoryById } from "~/lib/constants";
import type { MonthlyStats, CategoryStat } from "~/lib/types";

export const getMonthlySummary = createServerFn({ method: "GET" })
  .inputValidator((raw: unknown) => MonthlySummarySchema.parse(raw))
  .handler(async ({ data: { month } }): Promise<MonthlyStats> => {
    const rows = await db
      .select({ type: transactions.type, amount: transactions.amount })
      .from(transactions)
      .where(like(transactions.transactionDate, `${month}%`));

    const totalIncome  = rows.filter((r) => r.type === "income") .reduce((s, r) => s + r.amount, 0);
    const totalExpense = rows.filter((r) => r.type === "expense").reduce((s, r) => s + r.amount, 0);

    return { month, totalIncome, totalExpense, balance: totalIncome - totalExpense };
  });

export const getCategorySummary = createServerFn({ method: "GET" })
  .inputValidator((raw: unknown) => CategorySummarySchema.parse(raw))
  .handler(async ({ data: { month } }): Promise<CategoryStat[]> => {
    const rows = await db
      .select({ categoryId: transactions.categoryId, amount: transactions.amount })
      .from(transactions)
      .where(
        and(
          like(transactions.transactionDate, `${month}%`),
          eq(transactions.type, "expense"),
        )
      );

    const totalExpense = rows.reduce((s, r) => s + r.amount, 0);
    const map = new Map<string, { total: number; count: number }>();

    for (const row of rows) {
      const e = map.get(row.categoryId) ?? { total: 0, count: 0 };
      map.set(row.categoryId, { total: e.total + row.amount, count: e.count + 1 });
    }

    return Array.from(map.entries())
      .map(([categoryId, { total, count }]) => ({
        category:   getCategoryById(categoryId),
        total,
        count,
        percentage: totalExpense > 0 ? (total / totalExpense) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  });


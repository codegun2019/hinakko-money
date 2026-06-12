import { createServerFn } from "@tanstack/react-start";
import { and, asc, eq } from "drizzle-orm";
import { db } from "../client";
import { recurringRules } from "../schema";
import {
  DeleteRecurringSchema,
  DueRecurringSchema,
  MarkRecurringAppliedSchema,
  UpsertRecurringSchema,
} from "~/lib/validation";
import { getCategoryById } from "~/lib/constants";
import type { RecurringRule } from "~/lib/types";

function mapRule(row: typeof recurringRules.$inferSelect): RecurringRule {
  return {
    ...row,
    category: getCategoryById(row.categoryId),
  };
}

export const listRecurringRules = createServerFn({ method: "GET" })
  .handler(async (): Promise<RecurringRule[]> => {
    const rows = await db.select().from(recurringRules).orderBy(asc(recurringRules.dayOfMonth));
    return rows.map(mapRule);
  });

export const listDueRecurringRules = createServerFn({ method: "GET" })
  .inputValidator((raw: unknown) => DueRecurringSchema.parse(raw))
  .handler(async ({ data: { date } }): Promise<RecurringRule[]> => {
    const day = Number(date.slice(8, 10));
    const month = date.slice(0, 7);
    const rows = await db
      .select()
      .from(recurringRules)
      .where(
        and(
          eq(recurringRules.active, true),
          eq(recurringRules.dayOfMonth, day),
        ),
      );
    return rows
      .filter((r) => r.lastAppliedMonth !== month)
      .map(mapRule);
  });

export const upsertRecurringRule = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => UpsertRecurringSchema.parse(raw))
  .handler(async ({ data }) => {
    const id = data.id ?? crypto.randomUUID();
    const now = new Date().toISOString();
    const existing = data.id
      ? await db.select().from(recurringRules).where(eq(recurringRules.id, data.id)).limit(1)
      : [];

    if (existing[0]) {
      await db
        .update(recurringRules)
        .set({
          type: data.type,
          title: data.title,
          amount: data.amount,
          categoryId: data.categoryId,
          paymentMethod: data.paymentMethod,
          dayOfMonth: data.dayOfMonth,
          note: data.note ?? null,
          active: data.active ?? existing[0].active,
        })
        .where(eq(recurringRules.id, id));
    } else {
      await db.insert(recurringRules).values({
        id,
        type: data.type,
        title: data.title,
        amount: data.amount,
        categoryId: data.categoryId,
        paymentMethod: data.paymentMethod,
        dayOfMonth: data.dayOfMonth,
        note: data.note ?? null,
        active: data.active ?? true,
        lastAppliedMonth: null,
        createdAt: now,
      });
    }
    return { id };
  });

export const deleteRecurringRule = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => DeleteRecurringSchema.parse(raw))
  .handler(async ({ data: { id } }) => {
    await db.delete(recurringRules).where(eq(recurringRules.id, id));
    return { id };
  });

export const markRecurringApplied = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => MarkRecurringAppliedSchema.parse(raw))
  .handler(async ({ data: { id, month } }) => {
    await db
      .update(recurringRules)
      .set({ lastAppliedMonth: month })
      .where(eq(recurringRules.id, id));
    return { id };
  });

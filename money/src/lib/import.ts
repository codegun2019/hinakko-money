import { CreateTransactionSchema, type CreateTransactionInput } from "~/lib/validation";
import type { Transaction } from "~/lib/types";

function normalizeItem(raw: unknown): CreateTransactionInput | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const candidate = {
    type:            o.type,
    title:           o.title,
    amount:          typeof o.amount === "string" ? parseFloat(o.amount) : o.amount,
    categoryId:      o.categoryId,
    paymentMethod:   o.paymentMethod,
    transactionDate: o.transactionDate,
    note:            o.note ?? undefined,
  };
  const parsed = CreateTransactionSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}

export function parseImportJSON(text: string): { items: CreateTransactionInput[]; skipped: number } {
  const data: unknown = JSON.parse(text);
  const rows = Array.isArray(data)
    ? data
    : data && typeof data === "object" && Array.isArray((data as { transactions?: unknown }).transactions)
      ? (data as { transactions: unknown[] }).transactions
      : null;

  if (!rows) {
    throw new Error("INVALID_FORMAT");
  }

  const items: CreateTransactionInput[] = [];
  let skipped = 0;

  for (const row of rows) {
    const item = normalizeItem(row);
    if (item) items.push(item);
    else skipped++;
  }

  if (items.length === 0 && rows.length > 0) {
    throw new Error("NO_VALID_ROWS");
  }

  return { items, skipped };
}

/** Map exported Transaction rows to create inputs (strip server fields). */
export function transactionsToImportInputs(transactions: Transaction[]): CreateTransactionInput[] {
  return transactions
    .map((tx) => normalizeItem({
      type: tx.type,
      title: tx.title,
      amount: tx.amount,
      categoryId: tx.categoryId,
      paymentMethod: tx.paymentMethod,
      transactionDate: tx.transactionDate,
      note: tx.note,
    }))
    .filter((x): x is CreateTransactionInput => x !== null);
}

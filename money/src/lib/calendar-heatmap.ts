import type { Transaction } from "~/lib/types";

export type HeatLevel = 0 | 1 | 2 | 3;

export function expenseByDay(transactions: Transaction[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const tx of transactions) {
    if (tx.type !== "expense") continue;
    map.set(tx.transactionDate, (map.get(tx.transactionDate) ?? 0) + tx.amount);
  }
  return map;
}

/** Map each date to heat 0–3 from relative daily expense in the month. */
export function buildMonthHeatMap(transactions: Transaction[]): Map<string, HeatLevel> {
  const byDay = expenseByDay(transactions);
  const max = Math.max(0, ...byDay.values());
  const result = new Map<string, HeatLevel>();

  for (const [date, amount] of byDay) {
    if (amount <= 0 || max <= 0) {
      result.set(date, 0);
      continue;
    }
    const ratio = amount / max;
    const level: HeatLevel =
      ratio >= 0.75 ? 3 : ratio >= 0.45 ? 2 : ratio >= 0.15 ? 1 : 1;
    result.set(date, level);
  }

  return result;
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import type { DailyGroup, Transaction } from "./types";
import { getCurrencyConfig, type CurrencyCode } from "./settings";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrencyAmount(amount: number, currency: CurrencyCode = "THB"): string {
  const { symbol, locale } = getCurrencyConfig(currency);
  return `${symbol}${amount.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

/** @deprecated use formatCurrencyAmount or useFormatCurrency hook */
export function formatCurrency(amount: number, symbol = "฿"): string {
  return `${symbol}${amount.toLocaleString("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDateLabel(dateStr: string): string {
  const d = parseISO(dateStr);
  if (isToday(d))     return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "EEE, d MMM");
}

export function formatMonthYear(month: string): string {
  return format(parseISO(month + "-01"), "MMMM yyyy");
}

export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function groupTransactionsByDay(transactions: Transaction[]): DailyGroup[] {
  const map = new Map<string, Transaction[]>();
  for (const tx of transactions) {
    const existing = map.get(tx.transactionDate) ?? [];
    map.set(tx.transactionDate, [...existing, tx]);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, txs]) => ({
      date,
      transactions: txs.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      totalIncome:  txs.filter((t) => t.type === "income") .reduce((s, t) => s + t.amount, 0),
      totalExpense: txs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    }));
}

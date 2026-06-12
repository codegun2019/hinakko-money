import {
  startOfDay, endOfDay, startOfWeek, endOfWeek,
  startOfMonth, endOfMonth, isWithinInterval, parseISO,
} from "date-fns";
import { getCategoryById } from "~/lib/constants";
import type { PaymentMethod, Transaction } from "~/lib/types";

export type TransactionTypeFilter = "all" | "income" | "expense";
export type PaymentMethodFilter = PaymentMethod | "all";
export type DateRangeFilter = "all" | "today" | "week" | "month" | "custom";

export interface TransactionFilters {
  query:         string;
  type:          TransactionTypeFilter;
  paymentMethod: PaymentMethodFilter;
  dateRange:     DateRangeFilter;
  customFrom?:   string;
  customTo?:     string;
}

export const DEFAULT_FILTERS: TransactionFilters = {
  query:         "",
  type:          "all",
  paymentMethod: "all",
  dateRange:     "all",
};

export function searchTransactions(txs: Transaction[], query: string): Transaction[] {
  const q = query.trim().toLowerCase();
  if (!q) return txs;

  return txs.filter((tx) => {
    const cat = getCategoryById(tx.categoryId);
    return (
      tx.title.toLowerCase().includes(q) ||
      cat.name.toLowerCase().includes(q) ||
      (tx.note?.toLowerCase().includes(q) ?? false)
    );
  });
}

function getDateInterval(filters: TransactionFilters): { start: Date; end: Date } | null {
  const now = new Date();

  switch (filters.dateRange) {
    case "today":
      return { start: startOfDay(now), end: endOfDay(now) };
    case "week":
      return {
        start: startOfWeek(now, { weekStartsOn: 1 }),
        end:   endOfWeek(now, { weekStartsOn: 1 }),
      };
    case "month":
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case "custom":
      if (!filters.customFrom || !filters.customTo) return null;
      return {
        start: startOfDay(parseISO(filters.customFrom)),
        end:   endOfDay(parseISO(filters.customTo)),
      };
    default:
      return null;
  }
}

export function filterTransactions(txs: Transaction[], filters: TransactionFilters): Transaction[] {
  let result = searchTransactions(txs, filters.query);

  if (filters.type !== "all") {
    result = result.filter((tx) => tx.type === filters.type);
  }

  if (filters.paymentMethod !== "all") {
    result = result.filter((tx) => tx.paymentMethod === filters.paymentMethod);
  }

  const interval = getDateInterval(filters);
  if (interval) {
    result = result.filter((tx) =>
      isWithinInterval(parseISO(tx.transactionDate), interval)
    );
  }

  return result;
}

export function hasActiveFilters(filters: TransactionFilters): boolean {
  return (
    filters.query.trim() !== "" ||
    filters.type !== "all" ||
    filters.paymentMethod !== "all" ||
    filters.dateRange !== "all"
  );
}

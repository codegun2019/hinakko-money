import type { TranslationKey } from "~/lib/i18n";
import type { BudgetWithSpent, MonthlyStats, RecurringRule } from "~/lib/types";

export type NotificationSeverity = "info" | "warning" | "danger";

export interface AppNotification {
  id:       string;
  titleKey: TranslationKey;
  descKey:  TranslationKey;
  params?:  Record<string, string | number>;
  severity: NotificationSeverity;
}

export function buildNotifications(
  budgets: BudgetWithSpent[],
  offlineQueueCount: number,
  stats: MonthlyStats,
  prevStats: MonthlyStats | null,
  dueRecurring: RecurringRule[] = [],
): AppNotification[] {
  const items: AppNotification[] = [];

  for (const rule of dueRecurring) {
    items.push({
      id:       `recurring-${rule.id}`,
      titleKey: "notifications.recurringDueTitle",
      descKey:  "notifications.recurringDueDesc",
      params:   { title: rule.title },
      severity: "info",
    });
  }

  if (offlineQueueCount > 0) {
    items.push({
      id:       "offline-queue",
      titleKey: "notifications.offlineQueueTitle",
      descKey:  "notifications.offlineQueueDesc",
      params:   { count: offlineQueueCount },
      severity: "warning",
    });
  }

  for (const b of budgets) {
    if (b.amount <= 0) continue;
    const ratio = b.spent / b.amount;
    if (ratio >= 1) {
      items.push({
        id:       `budget-over-${b.categoryId}`,
        titleKey: "notifications.budgetOverTitle",
        descKey:  "notifications.budgetOverDesc",
        params:   { categoryId: b.categoryId, percent: Math.round(ratio * 100) },
        severity: "danger",
      });
    } else if (ratio >= 0.8) {
      items.push({
        id:       `budget-warn-${b.categoryId}`,
        titleKey: "notifications.budgetWarnTitle",
        descKey:  "notifications.budgetWarnDesc",
        params:   { categoryId: b.categoryId, percent: Math.round(ratio * 100) },
        severity: "warning",
      });
    }
  }

  if (prevStats && prevStats.totalExpense > 0 && stats.totalExpense > 0) {
    const change = ((stats.totalExpense - prevStats.totalExpense) / prevStats.totalExpense) * 100;
    if (Math.abs(change) >= 8) {
      items.push({
        id:       "expense-trend",
        titleKey: change > 0 ? "notifications.expenseUpTitle" : "notifications.expenseDownTitle",
        descKey:  change > 0 ? "notifications.expenseUpDesc" : "notifications.expenseDownDesc",
        params:   { percent: Math.abs(Math.round(change)) },
        severity: change > 0 ? "warning" : "info",
      });
    }
  }

  return items;
}

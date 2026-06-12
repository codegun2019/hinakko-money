import { useMemo } from "react";
import { useFormatCurrency } from "~/lib/useFormatCurrency";
import { useTranslation } from "~/lib/i18n";
import { cn } from "~/lib/format";
import type { BudgetWithSpent, MonthlyStats } from "~/lib/types";

interface Props {
  stats:     MonthlyStats;
  prevStats: MonthlyStats | null;
  budgets:   BudgetWithSpent[];
  /** Banking hero uses light-on-dark text */
  variant?:  "classic" | "banking";
}

export function HeroInsight({ stats, prevStats, budgets, variant = "classic" }: Props) {
  const { t } = useTranslation();
  const fmt = useFormatCurrency();
  const banking = variant === "banking";

  const budgetTotal = useMemo(
    () => budgets.reduce((sum, b) => sum + b.amount, 0),
    [budgets],
  );
  const budgetSpent = useMemo(
    () => budgets.reduce((sum, b) => sum + b.spent, 0),
    [budgets],
  );
  const budgetRatio = budgetTotal > 0 ? Math.min(budgetSpent / budgetTotal, 1.2) : 0;
  const budgetPercent = budgetTotal > 0 ? Math.round((budgetSpent / budgetTotal) * 100) : 0;

  const expenseTrend = useMemo(() => {
    if (!prevStats || prevStats.totalExpense <= 0 || stats.totalExpense <= 0) return null;
    const change = ((stats.totalExpense - prevStats.totalExpense) / prevStats.totalExpense) * 100;
    if (Math.abs(change) < 5) return null;
    return Math.round(change);
  }, [prevStats, stats.totalExpense]);

  const monthProgress = useMemo(() => {
    const day = new Date().getDate();
    const daysInMonth = new Date(
      Number(stats.month.slice(0, 4)),
      Number(stats.month.slice(5, 7)),
      0,
    ).getDate();
    return Math.round((day / daysInMonth) * 100);
  }, [stats.month]);

  if (!expenseTrend && budgetTotal <= 0) return null;

  return (
    <div className={cn("hero-insight space-y-2.5", banking && "hero-insight-banking")}>
      {expenseTrend !== null && (
        <p className={cn("text-caption", banking ? "banking-hero-sub" : "text-fg-muted")}>
          {expenseTrend > 0
            ? t("insight.expenseUp", { percent: expenseTrend })
            : t("insight.expenseDown", { percent: Math.abs(expenseTrend) })}
          {" · "}
          {t("insight.monthProgress", { percent: monthProgress })}
        </p>
      )}

      {budgetTotal > 0 && (
        <div className="hero-budget-bar">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className={cn("text-micro font-semibold", banking ? "text-white/80" : "text-fg-muted")}>
              {t("insight.budgetLabel")}
            </span>
            <span className={cn("text-micro tabular-nums font-semibold", banking ? "text-white" : "text-fg")}>
              {fmt(budgetSpent)} / {fmt(budgetTotal)}
            </span>
          </div>
          <div className={cn("hero-budget-track", banking && "hero-budget-track-banking")}>
            <div
              className={cn(
                "hero-budget-fill",
                budgetPercent >= 100 ? "is-over" : budgetPercent >= 80 ? "is-warn" : "is-ok",
                banking && "hero-budget-fill-banking",
              )}
              style={{ width: `${Math.min(budgetRatio * 100, 100)}%` }}
            />
          </div>
          <p className={cn("mt-1 text-micro", banking ? "text-white/70" : "text-fg-muted")}>
            {budgetPercent >= 100
              ? t("insight.budgetOver")
              : t("insight.budgetUsed", { percent: budgetPercent })}
          </p>
        </div>
      )}
    </div>
  );
}

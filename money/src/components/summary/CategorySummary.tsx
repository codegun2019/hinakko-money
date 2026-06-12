import { useMemo, useState } from "react";
import type { BudgetWithSpent, Transaction } from "~/lib/types";
import { getCategoryById } from "~/lib/constants";
import { CategoryIcon } from "~/components/icons";
import { useFormatCurrency } from "~/lib/useFormatCurrency";
import { TransactionRow } from "~/components/transaction/TransactionRow";
import { EmptyState } from "~/components/ui/EmptyState";
import { Button } from "~/components/ui/Button";
import { getCategoryName, useTranslation } from "~/lib/i18n";
import { cn } from "~/lib/format";

interface Props {
  transactions:  Transaction[];
  budgets?:        Map<string, BudgetWithSpent>;
  onEdit?:       (id: string) => void;
  onDelete?:     (id: string) => Promise<void>;
  onDuplicate?:  (transaction: Transaction) => Promise<void>;
  emptyMessage?: string;
  onAddTransaction?: () => void;
}

interface Bucket {
  categoryId:  string;
  total:       number;
  txs:         Transaction[];
  netType:     "income" | "expense";
}

export function CategorySummary({ transactions, budgets, onEdit, onDelete, onDuplicate, emptyMessage, onAddTransaction }: Props) {
  const fmt = useFormatCurrency();
  const { t, language } = useTranslation();
  const [expanded, setExpanded] = useState<string | null>(null);
  const defaultEmpty = t("dashboard.emptyNoTransactions");

  const buckets: Bucket[] = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const tx of transactions) {
      const list = map.get(tx.categoryId) ?? [];
      map.set(tx.categoryId, [...list, tx]);
    }
    return Array.from(map.entries())
      .map(([categoryId, txs]) => {
        const totalIncome  = txs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
        const totalExpense = txs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
        return {
          categoryId,
          total:   Math.max(totalIncome, totalExpense),
          txs,
          netType: totalIncome > totalExpense ? "income" as const : "expense" as const,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [transactions]);

  if (buckets.length === 0) {
    return (
      <EmptyState
        title={emptyMessage ?? defaultEmpty}
        description={t("dashboard.categoryEmptyDesc")}
        action={
          onAddTransaction ? (
            <Button fullWidth size="lg" onClick={onAddTransaction}>
              {t("dashboard.emptyAddFirst")}
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-3 content-pad pb-6">
      {buckets.map(({ categoryId, total, txs, netType }, i) => {
        const cat    = getCategoryById(categoryId);
        const isOpen = expanded === categoryId;
        const budget = budgets?.get(categoryId);
        const expenseTotal = txs.filter((tx) => tx.type === "expense").reduce((s, tx) => s + tx.amount, 0);
        const budgetPct = budget && budget.amount > 0
          ? Math.min(100, Math.round((expenseTotal / budget.amount) * 100))
          : null;
        const budgetOver = budget ? expenseTotal > budget.amount : false;

        return (
          <div key={categoryId} className="mx-4 animate-slide-up" style={{ animationDelay: `${i * 40}ms` }}>
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : categoryId)}
              className="flex w-full items-center gap-3 glass-card px-4 py-3.5 active:scale-[0.985] transition-transform duration-150"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ backgroundColor: cat.color + "18" }}>
                <CategoryIcon categoryId={cat.id} size="md" color={cat.color} />
              </div>
              <div className="flex flex-1 flex-col gap-0.5 text-left min-w-0">
                <span className="text-title text-fg">{getCategoryName(cat.id, language)}</span>
                <span className="text-caption text-fg-subtle">{t("dashboard.transactionCount", { count: txs.length })}</span>
                {budget && (
                  <>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-muted">
                      <div
                        className={`h-full rounded-full ${budgetOver ? "bg-coral-400" : "bg-mint-500"}`}
                        style={{ width: `${budgetPct ?? 0}%` }}
                      />
                    </div>
                    <span className="text-micro text-fg-muted">
                      {fmt(expenseTotal)} / {fmt(budget.amount)}
                      {budgetOver ? ` · ${t("budget.over")}` : ""}
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <span className={cn("text-title tabular-nums", netType === "income" ? "text-income" : "text-coral-400")}>
                  {netType === "income" ? "+" : "−"}{fmt(total)}
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A8A29E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </button>

            {isOpen && (
              <div className="mt-2 card-surface overflow-hidden animate-scale-in">
                {txs.map((tx, j) => (
                  <div key={tx.id}>
                    {j > 0 && <div className="mx-4 h-px bg-[var(--color-border-subtle)]" />}
                    <TransactionRow
                      transaction={tx}
                      onEdit={tx.id.startsWith("pending-") ? undefined : onEdit}
                      onDelete={onDelete}
                      onDuplicate={onDuplicate}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

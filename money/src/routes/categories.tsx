import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { format, addMonths, subMonths, parseISO } from "date-fns";
import { lazy, Suspense, useMemo, useState } from "react";
import { PageLayout } from "~/components/app/PageLayout";
import { MonthNavHeader } from "~/components/app/MonthNavHeader";
import { EmptyState } from "~/components/ui/EmptyState";
import { PageSkeleton } from "~/components/ui/PageSkeleton";
import { TransactionRow } from "~/components/transaction/TransactionRow";
import { getCategorySummary, getMonthlySummary } from "~/db/queries/summary";
import { listTransactionsByMonth } from "~/db/queries/transactions";
import { mergeWithPending } from "~/lib/offline-queue";
import { removeTransaction, duplicateTransaction } from "~/lib/transactions-client";
import { DashboardSearchSchema } from "~/lib/validation";
import { getCurrentMonth } from "~/lib/format";
import { CategoryIcon } from "~/components/icons";
import { useFormatCurrency } from "~/lib/useFormatCurrency";
import { buildEditSearch } from "~/lib/navigation";
import { getCategoryById } from "~/lib/constants";
import { getCategoryName, useTranslation } from "~/lib/i18n";
import { showToast, showErrorToast } from "~/lib/toast";
import type { CategoryStat, Transaction } from "~/lib/types";

const CategoryChart = lazy(() => import("~/components/categories/CategoryChart"));

export const Route = createFileRoute("/categories")({
  validateSearch: DashboardSearchSchema,

  loaderDeps: ({ search: { month } }) => ({
    month: month ?? getCurrentMonth(),
  }),

  loader: async ({ deps: { month } }) => {
    const [categories, stats, transactions] = await Promise.all([
      getCategorySummary({ data: { month } }),
      getMonthlySummary({ data: { month } }),
      listTransactionsByMonth({ data: { month } }),
    ]);
    return { categories, stats, month, transactions };
  },

  pendingComponent: () => <PageSkeleton />,

  component: CategoriesPage,
});

function CategoriesPage() {
  const { categories, stats, month, transactions } = Route.useLoaderData();
  const navigate = useNavigate({ from: "/categories" });
  const router   = useRouter();
  const fmt = useFormatCurrency();
  const { t, dateLocale, language } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const allTransactions = useMemo(
    () => (typeof window !== "undefined" ? mergeWithPending(transactions, month) : transactions),
    [transactions, month],
  );

  const goToMonth = (offset: 1 | -1) => {
    const d    = parseISO(month + "-01");
    const next = offset === 1 ? addMonths(d, 1) : subMonths(d, 1);
    setExpandedId(null);
    void navigate({ search: { month: format(next, "yyyy-MM") } });
  };

  const handleEdit = (id: string) => {
    void navigate({
      to:     "/edit/$id",
      params: { id },
      search: buildEditSearch("/categories", month),
    });
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await removeTransaction(id);
      await router.invalidate();
      showToast(result.offline ? t("toast.savedOffline") : t("toast.deleted"));
    } catch {
      showErrorToast(t("transaction.deleteFailed"));
    }
  };

  const handleDuplicate = async (tx: Transaction) => {
    try {
      const result = await duplicateTransaction(tx);
      await router.invalidate();
      showToast(result.offline ? t("toast.savedOffline") : t("toast.duplicated"));
    } catch {
      showErrorToast(t("transaction.duplicateFailed"));
    }
  };

  const monthLabel = format(parseISO(month + "-01"), "MMMM yyyy", { locale: dateLocale });
  const chartData  = categories.map((c) => ({
    name:  getCategoryName(c.category.id, language),
    value: c.total,
    color: getCategoryById(c.category.id).color,
  }));
  const totalExpense = stats.totalExpense;

  const txsByCategory = (categoryId: string): Transaction[] =>
    allTransactions.filter((t) => t.categoryId === categoryId && t.type === "expense");

  return (
    <PageLayout
      header={
        <MonthNavHeader
          title={monthLabel}
          onPrev={() => goToMonth(-1)}
          onNext={() => goToMonth(1)}
        />
      }
    >
      <div className="card-surface mx-4 mt-4 px-4 py-3.5 flex items-center justify-around">
        <Stat label={t("summary.income")}  value={fmt(stats.totalIncome)}  colorClass="text-income" />
        <div className="h-8 w-px bg-[var(--color-border-subtle)]" />
        <Stat label={t("summary.expense")} value={fmt(stats.totalExpense)} colorClass="text-coral-400" />
        <div className="h-8 w-px bg-[var(--color-border-subtle)]" />
        <Stat
          label={t("summary.balance")}
          value={fmt(stats.balance)}
          colorClass={stats.balance >= 0 ? "text-income" : "text-coral-400"}
        />
      </div>

      {categories.length === 0 ? (
        <EmptyState title={t("categories.emptyTitle")} description={t("categories.emptyDesc")} />
      ) : (
        <>
          <Suspense fallback={<div className="mx-4 mt-3 h-[280px] rounded-[var(--radius-card)] skeleton" />}>
            <CategoryChart chartData={chartData} totalExpense={totalExpense} />
          </Suspense>
          <div className="mx-4 mt-1 mb-2 flex flex-wrap gap-x-4 gap-y-2 justify-center">
            {categories.slice(0, 6).map((c) => (
              <div key={c.category.id} className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: getCategoryById(c.category.id).color }} />
                <span className="text-caption text-fg-muted">{getCategoryName(c.category.id, language)}</span>
              </div>
            ))}
          </div>

          <div className="mx-4 mt-3 mb-2 flex flex-col gap-2.5">
            {categories.map((c) => (
              <CategoryRow
                key={c.category.id}
                stat={c}
                total={totalExpense}
                expanded={expandedId === c.category.id}
                onToggle={() => setExpandedId(expandedId === c.category.id ? null : c.category.id)}
                transactions={txsByCategory(c.category.id)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                fmt={fmt}
                t={t}
                language={language}
              />
            ))}
          </div>
        </>
      )}
    </PageLayout>
  );
}

function Stat({ label, value, colorClass }: { label: string; value: string; colorClass: string }) {
  return (
    <div className="text-center min-w-0 px-1">
      <p className="text-label text-fg-muted mb-1 truncate leading-snug">{label}</p>
      <p className={`text-title tabular-nums truncate ${colorClass}`}>{value}</p>
    </div>
  );
}

function CategoryRow({
  stat, total, expanded, onToggle, transactions, onEdit, onDelete, onDuplicate, fmt, t, language,
}: {
  stat: CategoryStat;
  total: number;
  expanded: boolean;
  onToggle: () => void;
  transactions: Transaction[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  onDuplicate: (tx: Transaction) => Promise<void>;
  fmt: (amount: number) => string;
  t: ReturnType<typeof useTranslation>["t"];
  language: ReturnType<typeof useTranslation>["language"];
}) {
  const pct = total > 0 ? (stat.total / total) * 100 : 0;
  const cat = getCategoryById(stat.category.id);

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="w-full card-surface px-4 py-3.5 text-left active:scale-[0.985] transition-transform duration-150"
      >
        <div className="flex items-center gap-3 mb-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: cat.color + "18" }}>
            <CategoryIcon categoryId={cat.id} size="md" color={cat.color} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5 gap-2">
              <span className="text-body font-semibold text-fg truncate">{getCategoryName(stat.category.id, language)}</span>
              <span className="text-body font-bold text-coral-400 tabular-nums shrink-0">{fmt(stat.total)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-caption text-fg-muted">{t("categories.transactionCount", { count: stat.count })}</span>
              <span className="text-caption text-fg-muted tabular-nums">{pct.toFixed(1)}%</span>
            </div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 text-fg-subtle transition-transform ${expanded ? "rotate-180" : ""}`}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
        <div className="h-1.5 w-full rounded-full bg-[var(--color-border-subtle)] overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: getCategoryById(stat.category.id).color }} />
        </div>
      </button>

      {expanded && transactions.length > 0 && (
        <div className="mt-2 card-surface overflow-hidden animate-scale-in">
          {transactions.map((tx, i) => (
            <div key={tx.id}>
              {i > 0 && <div className="mx-4 h-px bg-[var(--color-border-subtle)]" />}
              <TransactionRow transaction={tx} onEdit={onEdit} onDelete={onDelete} onDuplicate={onDuplicate} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

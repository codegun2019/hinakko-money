import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  format, addMonths, subMonths, parseISO,
  getDaysInMonth, startOfMonth, getDay, isSameDay,
} from "date-fns";
import { PageLayout } from "~/components/app/PageLayout";
import { MonthNavHeader } from "~/components/app/MonthNavHeader";
import { listTransactionsByMonth } from "~/db/queries/transactions";
import { mergeWithPending } from "~/lib/offline-queue";
import { removeTransaction, duplicateTransaction } from "~/lib/transactions-client";
import { DashboardSearchSchema } from "~/lib/validation";
import { getCurrentMonth } from "~/lib/format";
import { useFormatCurrency } from "~/lib/useFormatCurrency";
import { buildEditSearch } from "~/lib/navigation";
import { buildMonthHeatMap } from "~/lib/calendar-heatmap";
import { useTranslation } from "~/lib/i18n";
import { cn } from "~/lib/format";
import { showToast, showErrorToast } from "~/lib/toast";
import { EmptyState } from "~/components/ui/EmptyState";
import { AppIcon } from "~/components/icons";
import { Icons } from "~/lib/icons";
import { PageSkeleton } from "~/components/ui/PageSkeleton";
import { TransactionRow } from "~/components/transaction/TransactionRow";
import type { Transaction } from "~/lib/types";

export const Route = createFileRoute("/calendar")({
  validateSearch: DashboardSearchSchema,

  loaderDeps: ({ search: { month } }) => ({
    month: month ?? getCurrentMonth(),
  }),

  loader: async ({ deps: { month } }) => {
    const transactions = await listTransactionsByMonth({ data: { month } });
    return { transactions, month };
  },

  pendingComponent: () => <PageSkeleton />,

  component: CalendarPage,
});

const WEEKDAY_KEYS = ["calendar.mon", "calendar.tue", "calendar.wed", "calendar.thu", "calendar.fri", "calendar.sat", "calendar.sun"] as const;

function buildGrid(month: string) {
  const first  = startOfMonth(parseISO(month + "-01"));
  const days   = getDaysInMonth(first);
  const offset = (getDay(first) + 6) % 7;
  return { days, offset };
}

function txByDay(transactions: Transaction[]) {
  const map = new Map<string, Transaction[]>();
  for (const tx of transactions) {
    const list = map.get(tx.transactionDate) ?? [];
    map.set(tx.transactionDate, [...list, tx]);
  }
  return map;
}

function CalendarPage() {
  const { transactions, month } = Route.useLoaderData();
  const navigate = useNavigate({ from: "/calendar" });
  const router   = useRouter();
  const fmt = useFormatCurrency();
  const { t, dateLocale } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const allTransactions = useMemo(
    () => (typeof window !== "undefined" ? mergeWithPending(transactions, month) : transactions),
    [transactions, month],
  );

  const goToMonth = (offset: 1 | -1) => {
    const d    = parseISO(month + "-01");
    const next = offset === 1 ? addMonths(d, 1) : subMonths(d, 1);
    setSelectedDate(null);
    void navigate({ search: { month: format(next, "yyyy-MM") } });
  };

  const handleEdit = (id: string) => {
    void navigate({
      to:     "/edit/$id",
      params: { id },
      search: buildEditSearch("/calendar", month),
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
  const { days, offset } = buildGrid(month);
  const byDay = txByDay(allTransactions);
  const heatMap = useMemo(() => buildMonthHeatMap(allTransactions), [allTransactions]);

  const selectedTxs = selectedDate ? (byDay.get(selectedDate) ?? []) : [];
  const selectedIncome  = selectedTxs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const selectedExpense = selectedTxs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const cells = [
    ...Array(offset).fill(null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];

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
      <div className="card-surface mx-4 mt-4 pt-3">
        <div className="grid grid-cols-7 mb-1 px-1">
          {WEEKDAY_KEYS.map((key) => (
            <div key={key} className="text-center text-micro text-fg-muted py-1 normal-case tracking-normal">
              {t(key)}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1 sm:gap-1 pb-3 px-1">
          {cells.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} />;
            const dateStr  = `${month}-${String(day).padStart(2, "0")}`;
            const dayTxs   = byDay.get(dateStr) ?? [];
            const hasInc   = dayTxs.some(t => t.type === "income");
            const hasExp   = dayTxs.some(t => t.type === "expense");
            const heat     = heatMap.get(dateStr) ?? 0;
            const isSelected = selectedDate === dateStr;
            const isToday  = isSameDay(parseISO(dateStr), new Date());

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className={cn(
                  "calendar-day-cell flex min-h-[44px] flex-col items-center justify-center py-1.5 rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500/40",
                  !isSelected && heat > 0 && `calendar-heat-${heat}`,
                  isSelected
                    ? "bg-mint-500 shadow-sm shadow-mint-500/25"
                    : isToday
                      ? "bg-mint-500/10 ring-1 ring-mint-500/20"
                      : "active:bg-surface-muted",
                )}
              >
                <span className={`text-caption font-semibold mb-1 tabular-nums ${
                  isSelected ? "text-white" : isToday ? "text-primary" : "text-fg-secondary"
                }`}>
                  {day}
                </span>
                <div className="flex gap-0.5 h-1.5">
                  {hasInc && (
                    <div className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white/80" : "bg-income"}`} />
                  )}
                  {hasExp && (
                    <div className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white/80" : "bg-coral-400"}`} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
        <p className="px-3 pb-3 text-micro text-fg-muted">{t("calendar.heatLegend")}</p>
      </div>

      {selectedDate ? (
        <div className="px-4 pt-4">
          <div className="flex items-center justify-between mb-3 gap-2">
            <p className="text-title text-fg truncate min-w-0 leading-snug">
              {format(parseISO(selectedDate), "EEEE, d MMMM", { locale: dateLocale })}
            </p>
            <div className="flex shrink-0 gap-3 text-caption">
              {selectedIncome > 0 && (
                <span className="text-income font-semibold tabular-nums">+{fmt(selectedIncome)}</span>
              )}
              {selectedExpense > 0 && (
                <span className="text-coral-400 font-semibold tabular-nums">−{fmt(selectedExpense)}</span>
              )}
            </div>
          </div>

          {selectedTxs.length === 0 ? (
            <EmptyState title={t("calendar.emptyDayTitle")} description={t("calendar.emptyDayDesc")} className="py-8" />
          ) : (
            <div className="card-surface overflow-hidden">
              {selectedTxs.map((tx, i) => (
                <div key={tx.id}>
                  {i > 0 && <div className="mx-4 h-px bg-[var(--color-border-subtle)]" />}
                  <TransactionRow
                    transaction={tx}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onDuplicate={handleDuplicate}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={<AppIcon icon={Icons.action.hand} size="xl" className="text-fg-muted" strokeWidth={1.5} />}
          title={t("calendar.selectDayTitle")}
          description={t("calendar.selectDayDesc")}
          className="py-8"
        />
      )}
    </PageLayout>
  );
}

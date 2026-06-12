import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { format, addMonths, subMonths, parseISO } from "date-fns";
import { PageLayout } from "~/components/app/PageLayout";
import { HeroMiniBar, MonthlySummary } from "~/components/summary/MonthlySummary";
import { DashboardSkeleton } from "~/components/summary/DashboardSkeleton";
import { TabBar, type DashboardTab } from "~/components/summary/TabBar";
import { CategorySummary } from "~/components/summary/CategorySummary";
import { TransactionList } from "~/components/transaction/TransactionList";
import { SearchFilterBar } from "~/components/transaction/SearchFilterBar";
import { listTransactionsByMonth } from "~/db/queries/transactions";
import { listBudgetsWithSpent } from "~/db/queries/budgets";
import { listDueRecurringRules } from "~/db/queries/recurring";
import { getMonthlySummary } from "~/db/queries/summary";
import { mergeWithPending, getQueueLength } from "~/lib/offline-queue";
import { removeTransaction, duplicateTransaction } from "~/lib/transactions-client";
import { buildNotifications } from "~/lib/notifications";
import { DashboardSearchSchema } from "~/lib/validation";
import { getCurrentMonth } from "~/lib/format";
import { buildEditSearch } from "~/lib/navigation";
import { useDebouncedValue } from "~/lib/useDebouncedValue";
import { useHeroScroll } from "~/lib/useHeroScroll";
import { useTranslation } from "~/lib/i18n";
import { showToast, showErrorToast } from "~/lib/toast";
import { useThemeTemplate } from "~/lib/themes/useTemplate";
import {
  DEFAULT_FILTERS,
  filterTransactions,
  hasActiveFilters,
  type TransactionFilters,
} from "~/lib/transaction-filters";
import type { Transaction } from "~/lib/types";
import { useSettingsStore } from "~/lib/store";
import { useUIStore } from "~/lib/ui-store";

export const Route = createFileRoute("/")({
  validateSearch: DashboardSearchSchema,

  loaderDeps: ({ search: { month } }) => ({
    month: month ?? getCurrentMonth(),
  }),

  loader: async ({ deps: { month } }) => {
    const prevMonth = format(subMonths(parseISO(`${month}-01`), 1), "yyyy-MM");
    const today = format(new Date(), "yyyy-MM-dd");
    const [transactions, stats, budgets, prevStats, dueRecurring] = await Promise.all([
      listTransactionsByMonth({ data: { month } }),
      getMonthlySummary({ data: { month } }),
      listBudgetsWithSpent({ data: { month } }),
      getMonthlySummary({ data: { month: prevMonth } }),
      listDueRecurringRules({ data: { date: today } }),
    ]);
    return { transactions, stats, budgets, prevStats, dueRecurring, month };
  },

  pendingComponent: DashboardSkeleton,

  component: DashboardPage,
});

function DashboardPage() {
  const { transactions, stats, budgets, prevStats, dueRecurring, month } = Route.useLoaderData();
  const navigate = useNavigate({ from: "/" });
  const router   = useRouter();
  const { t } = useTranslation();
  const addFlow = useSettingsStore((s) => s.addFlow);
  const openQuickAdd = useUIStore((s) => s.openQuickAdd);
  const { isGlassHero } = useThemeTemplate();
  const { heroRef, progress, compact } = useHeroScroll();
  const [tab, setTab] = useState<DashboardTab>("date");
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState<TransactionFilters>(DEFAULT_FILTERS);
  const debouncedQuery = useDebouncedValue(searchInput, 300);

  const allTransactions = useMemo(
    () => (typeof window !== "undefined" ? mergeWithPending(transactions, month) : transactions),
    [transactions, month],
  );

  const budgetMap = useMemo(
    () => new Map(budgets.map((b) => [b.categoryId, b])),
    [budgets],
  );

  const filtersActive = hasActiveFilters({ ...filters, query: debouncedQuery });

  const goToMonth = (offset: 1 | -1) => {
    const d    = parseISO(month + "-01");
    const next = offset === 1 ? addMonths(d, 1) : subMonths(d, 1);
    void navigate({ search: { month: format(next, "yyyy-MM") } });
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

  const handleEdit = (id: string) => {
    void navigate({
      to:         "/edit/$id",
      params:     { id },
      search:     buildEditSearch("/", month),
    });
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchInput("");
  };

  const notifications = useMemo(() => {
    if (typeof window === "undefined") return [];
    return buildNotifications(budgets, getQueueLength(), stats, prevStats, dueRecurring);
  }, [budgets, stats, prevStats, dueRecurring]);

  const handleDuplicate = async (tx: Transaction) => {
    try {
      const result = await duplicateTransaction(tx);
      await router.invalidate();
      showToast(result.offline ? t("toast.savedOffline") : t("toast.duplicated"));
    } catch {
      showErrorToast(t("transaction.duplicateFailed"));
    }
  };

  const goAdd = () => {
    if (addFlow === "quick") openQuickAdd();
    else void navigate({ to: "/add" });
  };

  const tabTxs: Transaction[] = useMemo(() => {
    let txs = allTransactions;
    if (tab === "cashcredit")  txs = txs.filter((t) => t.paymentMethod !== "installment");
    if (tab === "installment") txs = txs.filter((t) => t.paymentMethod === "installment");
    return filterTransactions(txs, { ...filters, query: debouncedQuery });
  }, [allTransactions, tab, filters, debouncedQuery]);

  const emptyMsg = filtersActive
    ? t("dashboard.emptyNoMatching")
    : tab === "installment"
      ? t("dashboard.emptyNoInstallment")
      : t("dashboard.emptyNoTransactions");

  return (
    <PageLayout>
      <MonthlySummary
        stats={stats}
        prevStats={prevStats}
        budgets={budgets}
        notifications={notifications}
        month={month}
        onPrevMonth={() => goToMonth(-1)}
        onNextMonth={() => goToMonth(1)}
        heroRef={heroRef}
        scrollProgress={progress}
      />

      <HeroMiniBar stats={stats} month={month} visible={compact} modern={isGlassHero} />

      <div className="sticky top-0 z-10 shrink-0 border-b border-app bg-surface/95 backdrop-blur-md banking-filter-bar">
        <TabBar active={tab} onChange={setTab} />
        <SearchFilterBar
          filters={filters}
          onChange={setFilters}
          searchInput={searchInput}
          onSearchChange={setSearchInput}
        />
      </div>

      {tab === "category" ? (
        <CategorySummary
          transactions={tabTxs}
          budgets={budgetMap}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          emptyMessage={emptyMsg}
          onAddTransaction={filtersActive ? undefined : goAdd}
        />
      ) : (
        <TransactionList
          transactions={tabTxs}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          emptyMessage={emptyMsg}
          filtersActive={filtersActive}
          onClearFilters={clearFilters}
          onAddTransaction={goAdd}
        />
      )}
    </PageLayout>
  );
}

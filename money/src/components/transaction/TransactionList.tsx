import { useMemo } from "react";
import { groupTransactionsByDay } from "~/lib/format";
import { TransactionGroup } from "./TransactionGroup";
import { EmptyState } from "~/components/ui/EmptyState";
import { Button } from "~/components/ui/Button";
import type { Transaction } from "~/lib/types";
import { useTranslation } from "~/lib/i18n";

interface Props {
  transactions:     Transaction[];
  onEdit?:          (id: string) => void;
  onDelete?:        (id: string) => Promise<void>;
  onDuplicate?:     (transaction: Transaction) => Promise<void>;
  emptyMessage?:    string;
  filtersActive?:   boolean;
  onClearFilters?:  () => void;
  onAddTransaction?: () => void;
}

export function TransactionList({
  transactions,
  onEdit,
  onDelete,
  onDuplicate,
  emptyMessage,
  filtersActive = false,
  onClearFilters,
  onAddTransaction,
}: Props) {
  const { t } = useTranslation();
  const groups = useMemo(() => groupTransactionsByDay(transactions), [transactions]);

  if (groups.length === 0) {
    const showAdd = !filtersActive && onAddTransaction;
    const showClear = filtersActive && onClearFilters;

    return (
      <EmptyState
        icon={
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        }
        title={emptyMessage ?? t("dashboard.emptyListTitle")}
        description={
          filtersActive
            ? t("dashboard.emptyFilterDesc")
            : t("dashboard.emptyListDesc")
        }
        action={
          showAdd ? (
            <Button fullWidth size="lg" onClick={onAddTransaction}>
              {t("dashboard.emptyAddFirst")}
            </Button>
          ) : showClear ? (
            <Button fullWidth size="lg" variant="ghost" onClick={onClearFilters}>
              {t("dashboard.emptyClearFilters")}
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-3 content-pad pb-2">
      {groups.map((group, i) => (
        <div key={group.date} className="animate-slide-up" style={{ animationDelay: `${i * 40}ms` }}>
          <TransactionGroup group={group} onEdit={onEdit} onDelete={onDelete} onDuplicate={onDuplicate} />
        </div>
      ))}
    </div>
  );
}

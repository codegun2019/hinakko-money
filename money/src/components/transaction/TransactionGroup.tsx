import { useMemo } from "react";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import type { DailyGroup, Transaction } from "~/lib/types";
import { useFormatCurrency } from "~/lib/useFormatCurrency";
import { useTranslation } from "~/lib/i18n";
import { cn } from "~/lib/format";
import { TransactionRow } from "./TransactionRow";

interface Props {
  group:        DailyGroup;
  onEdit?:      (id: string) => void;
  onDelete?:    (id: string) => Promise<void>;
  onDuplicate?: (transaction: Transaction) => Promise<void>;
}

export function TransactionGroup({ group, onEdit, onDelete, onDuplicate }: Props) {
  const fmt = useFormatCurrency();
  const { t, dateLocale } = useTranslation();

  const { day, meta, highlight } = useMemo(() => {
    const d = parseISO(group.date);
    if (isToday(d))     return { day: format(d, "d"), meta: t("date.today"), highlight: true };
    if (isYesterday(d)) return { day: format(d, "d"), meta: t("date.yesterday"), highlight: false };
    return { day: format(d, "d"), meta: format(d, "EEE, MMM", { locale: dateLocale }), highlight: false };
  }, [group.date, t, dateLocale]);

  const net    = group.totalIncome - group.totalExpense;
  const netStr = net >= 0 ? `+${fmt(net)}` : `−${fmt(Math.abs(net))}`;

  return (
    <div className="px-4">
      <div className="mb-2 flex items-center gap-2.5 px-0.5">
        <div className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold tabular-nums",
          highlight ? "banking-day-badge is-today bg-mint-500 text-white" : "banking-day-badge bg-mint-500/10 text-mint-500"
        )}>
          {day}
        </div>
        <span className="flex-1 text-caption font-semibold text-fg-muted">{meta}</span>
        <span className={`text-caption font-bold tabular-nums ${net >= 0 ? "text-income" : "text-coral-400"}`}>{netStr}</span>
      </div>

      <div className="card-surface overflow-hidden">
        {group.transactions.map((tx, i) => (
          <div key={tx.id}>
            {i > 0 && <div className="mx-3.5 h-px bg-[var(--color-border-subtle)]" />}
            <TransactionRow transaction={tx} onEdit={onEdit} onDelete={onDelete} onDuplicate={onDuplicate} />
          </div>
        ))}
      </div>
    </div>
  );
}

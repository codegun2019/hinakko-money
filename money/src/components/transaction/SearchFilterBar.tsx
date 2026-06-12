import { useState, type ReactNode } from "react";
import { cn } from "~/lib/format";
import { PAYMENT_METHODS } from "~/lib/constants";
import { AppIcon } from "~/components/icons";
import { Icons } from "~/lib/icons";
import { getPaymentLabel, useTranslation } from "~/lib/i18n";
import type { TranslationKey } from "~/lib/i18n";
import {
  DEFAULT_FILTERS,
  hasActiveFilters,
  type DateRangeFilter,
  type TransactionFilters,
  type TransactionTypeFilter,
} from "~/lib/transaction-filters";
import type { PaymentMethod } from "~/lib/types";

interface Props {
  filters:     TransactionFilters;
  onChange:    (filters: TransactionFilters) => void;
  searchInput: string;
  onSearchChange: (query: string) => void;
}

export function SearchFilterBar({ filters, onChange, searchInput, onSearchChange }: Props) {
  const { t, language } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const active = hasActiveFilters(filters);

  const TYPE_OPTIONS: { value: TransactionTypeFilter; labelKey: TranslationKey }[] = [
    { value: "all",     labelKey: "common.all" },
    { value: "income",  labelKey: "filter.income" },
    { value: "expense", labelKey: "filter.expense" },
  ];

  const DATE_OPTIONS: { value: DateRangeFilter; labelKey: TranslationKey }[] = [
    { value: "all",    labelKey: "filter.allDates" },
    { value: "today",  labelKey: "filter.today" },
    { value: "week",   labelKey: "filter.thisWeek" },
    { value: "month",  labelKey: "filter.thisMonth" },
    { value: "custom", labelKey: "filter.custom" },
  ];

  const set = (patch: Partial<TransactionFilters>) => onChange({ ...filters, ...patch });

  return (
    <div className="space-y-2.5 px-4 py-2.5">
      <div className="relative">
        <AppIcon
          icon={Icons.action.search}
          size="sm"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted pointer-events-none"
        />
        <input
          type="search"
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("filter.searchPlaceholder")}
          aria-label={t("filter.searchAria")}
          className="w-full min-h-[42px] rounded-xl border border-app bg-card pl-10 pr-10 text-body text-fg outline-none placeholder:text-fg-subtle focus-visible:ring-2 focus-visible:ring-mint-500/40"
        />
        {searchInput && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted active:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500 rounded-full"
            aria-label={t("filter.clearSearch")}
          >
            <AppIcon icon={Icons.action.close} size="sm" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className={cn(
            "flex min-h-[34px] items-center gap-1.5 rounded-lg px-3 text-caption font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500/40",
            expanded || active
              ? "chip-active"
              : "chip-inactive border border-app bg-card"
          )}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="8" y1="12" x2="16" y2="12" />
            <line x1="11" y1="18" x2="13" y2="18" />
          </svg>
          {t("filter.filters")}
          {active && !expanded && (
            <span className="h-1.5 w-1.5 rounded-full bg-mint-500" aria-hidden />
          )}
        </button>
        {active && (
          <button
            type="button"
            onClick={() => { onChange(DEFAULT_FILTERS); onSearchChange(""); }}
            className="rounded-lg px-2 text-caption text-fg-muted active:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500/40"
          >
            {t("filter.clearAll")}
          </button>
        )}
      </div>

      {expanded && (
        <div className="space-y-3 animate-slide-up">
          <FilterGroup label={t("filter.type")}>
            {TYPE_OPTIONS.map(({ value, labelKey }) => (
              <FilterChip
                key={value}
                active={filters.type === value}
                onClick={() => set({ type: value })}
                label={t(labelKey)}
              />
            ))}
          </FilterGroup>

          <FilterGroup label={t("filter.payment")}>
            <FilterChip active={filters.paymentMethod === "all"} onClick={() => set({ paymentMethod: "all" })} label={t("common.all")} />
            {PAYMENT_METHODS.map(({ value }) => (
              <FilterChip
                key={value}
                active={filters.paymentMethod === value}
                onClick={() => set({ paymentMethod: value as PaymentMethod })}
                label={getPaymentLabel(value, language)}
              />
            ))}
          </FilterGroup>

          <FilterGroup label={t("filter.date")}>
            {DATE_OPTIONS.map(({ value, labelKey }) => (
              <FilterChip
                key={value}
                active={filters.dateRange === value}
                onClick={() => set({ dateRange: value })}
                label={t(labelKey)}
              />
            ))}
          </FilterGroup>

          {filters.dateRange === "custom" && (
            <div className="flex gap-2">
              <input
                type="date"
                value={filters.customFrom ?? ""}
                onChange={(e) => set({ customFrom: e.target.value })}
                aria-label={t("filter.fromDate")}
                className="min-h-[38px] flex-1 rounded-lg border border-app bg-card px-3 text-caption text-fg outline-none focus-visible:ring-2 focus-visible:ring-mint-500/40"
              />
              <span className="self-center text-fg-muted" aria-hidden>–</span>
              <input
                type="date"
                value={filters.customTo ?? ""}
                onChange={(e) => set({ customTo: e.target.value })}
                aria-label={t("filter.toDate")}
                className="min-h-[38px] flex-1 rounded-lg border border-app bg-card px-3 text-caption text-fg outline-none focus-visible:ring-2 focus-visible:ring-mint-500/40"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-label text-fg-muted mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-lg px-3 py-1.5 text-caption font-semibold transition-colors min-h-[30px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500/40",
        active ? "chip-active" : "chip-inactive active:opacity-80"
      )}
    >
      {label}
    </button>
  );
}

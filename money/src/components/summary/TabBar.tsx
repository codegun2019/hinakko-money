import { cn } from "~/lib/format";
import { useTranslation } from "~/lib/i18n";
import type { TranslationKey } from "~/lib/i18n";
import { useSegmentIndicator } from "~/lib/useSegmentIndicator";

export type DashboardTab = "date" | "category" | "cashcredit" | "installment";

const TABS: { value: DashboardTab; labelKey: TranslationKey }[] = [
  { value: "date",        labelKey: "dashboard.tabDate" },
  { value: "category",    labelKey: "dashboard.tabCategory" },
  { value: "cashcredit",  labelKey: "dashboard.tabCashCredit" },
  { value: "installment", labelKey: "dashboard.tabInstallment" },
];

interface Props {
  active:   DashboardTab;
  onChange: (tab: DashboardTab) => void;
}

export function TabBar({ active, onChange }: Props) {
  const { t } = useTranslation();
  const { containerRef, setItemRef, indicator } = useSegmentIndicator(active);

  return (
    <div className="px-3 py-2">
      <div
        ref={containerRef}
        className="segmented-control no-scrollbar"
        role="tablist"
        aria-label={t("dashboard.tabList")}
      >
        <span
          className="segmented-indicator"
          aria-hidden
          style={{
            transform: `translateX(${indicator.left}px)`,
            width: indicator.width,
            opacity: indicator.opacity,
          }}
        />
        {TABS.map(({ value, labelKey }) => {
          const isActive = active === value;
          return (
            <button
              key={value}
              ref={setItemRef(value)}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(value)}
              className={cn("segmented-tab", isActive && "is-active")}
            >
              {t(labelKey)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

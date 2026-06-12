import { format, parseISO } from "date-fns";
import { useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { useFormatCurrency } from "~/lib/useFormatCurrency";
import type { BudgetWithSpent, MonthlyStats } from "~/lib/types";
import { AnimatedCurrency } from "~/components/ui/AnimatedCurrency";
import { DashboardMenuSheet } from "~/components/dashboard/DashboardMenuSheet";
import { NotificationPanel } from "~/components/dashboard/NotificationPanel";
import { HeroInsight } from "~/components/summary/HeroInsight";
import { AppIcon } from "~/components/icons";
import { Icons } from "~/lib/icons";
import { useTranslation } from "~/lib/i18n";
import { useThemeTemplate } from "~/lib/themes/useTemplate";
import { cn } from "~/lib/format";
import type { AppNotification } from "~/lib/notifications";

interface Props {
  stats:           MonthlyStats;
  prevStats:       MonthlyStats | null;
  budgets:         BudgetWithSpent[];
  notifications:   AppNotification[];
  month:           string;
  onPrevMonth:     () => void;
  onNextMonth:     () => void;
  heroRef?:        RefObject<HTMLElement | null>;
  scrollProgress?: number;
}

export function MonthlySummary(props: Props) {
  const { isGlassHero } = useThemeTemplate();
  if (isGlassHero) return <BankingHeroSummary {...props} />;
  return <ClassicSummary {...props} />;
}

export function HeroMiniBar({
  stats,
  month,
  visible,
  modern = true,
}: {
  stats:   MonthlyStats;
  month:   string;
  visible: boolean;
  modern?: boolean;
}) {
  const { t, dateLocale } = useTranslation();
  const monthLabel = format(parseISO(month + "-01"), "MMMM yyyy", { locale: dateLocale });
  const isPositive = stats.balance >= 0;

  return (
    <div
      className={cn(
        "hero-mini-bar sticky top-0 z-20",
        modern ? "hero-mini-bar-banking glass-card" : "hero-mini-bar-classic",
        visible && "is-visible",
      )}
      aria-hidden={!visible}
    >
      <span className="hero-mini-month truncate">{monthLabel}</span>
      <div className="hero-mini-balance min-w-0 text-right">
        <span className="hero-mini-label">{t("summary.balance")}</span>
        <span className={cn("hero-mini-amount tabular-nums", modern && "text-primary")}>
          <AnimatedCurrency value={isPositive ? stats.balance : -Math.abs(stats.balance)} duration={320} />
        </span>
      </div>
    </div>
  );
}

function NotificationBell({
  count,
  onClick,
  className,
  iconClassName,
}: {
  count: number;
  onClick: () => void;
  className?: string;
  iconClassName?: string;
}) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("relative shrink-0", className)}
      aria-label={count > 0 ? t("dashboard.notificationsCount", { count }) : t("dashboard.notifications")}
    >
      <AppIcon icon={Icons.action.bell} size="sm" className={iconClassName} />
      {count > 0 && (
        <span className="notification-badge" aria-hidden>{count > 9 ? "9+" : count}</span>
      )}
    </button>
  );
}

function ClassicSummary({ stats, prevStats, budgets, notifications, month, onPrevMonth, onNextMonth, heroRef, scrollProgress = 0 }: Props) {
  const { totalIncome, totalExpense, balance } = stats;
  const { t, dateLocale } = useTranslation();
  const monthLabel = format(parseISO(month + "-01"), "MMMM yyyy", { locale: dateLocale });
  const isPositive = balance >= 0;
  const fmt = useFormatCurrency();
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);

  return (
    <>
      <header
        ref={heroRef}
        className="hero-collapsible safe-top-inset shrink-0 border-b border-app bg-surface px-4 pb-3"
        style={{ "--hero-progress": scrollProgress } as CSSProperties}
      >
        <div className="hero-collapsible-toolbar flex items-center justify-between gap-2 mb-3">
          <button type="button" onClick={() => setMenuOpen(true)} className="icon-btn h-9 w-9 shrink-0" aria-label={t("dashboard.menuOpen")}>
            <AppIcon icon={Icons.action.menu} size="sm" />
          </button>
          <div className="flex min-w-0 flex-1 items-center justify-center gap-0.5 rounded-xl border border-app glass-card px-0.5 py-0.5">
            <button type="button" onClick={onPrevMonth} className="icon-btn h-8 w-8 shrink-0" aria-label={t("nav.prevMonth")}>
              <AppIcon icon={Icons.action.chevronLeft} size="sm" strokeWidth={2.2} />
            </button>
            <span className="min-w-0 flex-1 truncate px-1 text-center text-caption font-semibold text-fg">{monthLabel}</span>
            <button type="button" onClick={onNextMonth} className="icon-btn h-8 w-8 shrink-0" aria-label={t("nav.nextMonth")}>
              <AppIcon icon={Icons.action.chevronRight} size="sm" strokeWidth={2.2} />
            </button>
          </div>
          <NotificationBell
            count={notifications.length}
            onClick={() => setBellOpen(true)}
            className="icon-btn h-9 w-9"
          />
        </div>

        <div className="hero-collapsible-body" data-onboarding="balance">
          <p className="text-label text-fg-muted mb-1">{t("summary.totalBalance")}</p>
          <p className="text-display text-fg">
            <AnimatedCurrency value={isPositive ? balance : -Math.abs(balance)} className="text-display" />
          </p>
          {totalIncome > 0 && (
            <p className="mt-1 text-caption text-fg-muted">
              {balance >= 0
                ? t("summary.savedPercent", { percent: Math.round((balance / totalIncome) * 100) })
                : t("summary.overspent", { amount: fmt(Math.abs(balance)) })}
            </p>
          )}
          <div className="mt-3">
            <HeroInsight stats={stats} prevStats={prevStats} budgets={budgets} variant="classic" />
          </div>
        </div>

        <div className="hero-collapsible-stats grid grid-cols-2 gap-2">
          <ClassicStatCard icon={<AppIcon icon={Icons.action.arrowUp} size="sm" className="text-income" strokeWidth={2.5} />} label={t("summary.income")} amount={totalIncome} accent="income" />
          <ClassicStatCard icon={<AppIcon icon={Icons.action.arrowDown} size="sm" className="text-coral-400" strokeWidth={2.5} />} label={t("summary.expense")} amount={totalExpense} accent="expense" />
        </div>
      </header>

      <DashboardMenuSheet open={menuOpen} onClose={() => setMenuOpen(false)} />
      <NotificationPanel open={bellOpen} onClose={() => setBellOpen(false)} notifications={notifications} />
    </>
  );
}

function BankingHeroSummary({ stats, prevStats, budgets, notifications, month, onPrevMonth, onNextMonth, heroRef, scrollProgress = 0 }: Props) {
  const { totalIncome, totalExpense, balance } = stats;
  const { t, dateLocale } = useTranslation();
  const monthLabel = format(parseISO(month + "-01"), "MMMM yyyy", { locale: dateLocale });
  const isPositive = balance >= 0;
  const fmt = useFormatCurrency();
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);

  return (
    <>
      <header
        ref={heroRef}
        className="banking-hero banking-hero-collapsible safe-top-inset shrink-0 px-4 pb-5"
        style={{ "--hero-progress": scrollProgress } as CSSProperties}
      >
        <div className="hero-collapsible-toolbar mb-5 flex items-center justify-between gap-2">
          <button type="button" onClick={() => setMenuOpen(true)} className="banking-glass-btn h-10 w-10 shrink-0" aria-label={t("dashboard.menuOpen")}>
            <AppIcon icon={Icons.action.menu} size="sm" className="text-white" />
          </button>
          <div className="banking-month-pill">
            <button type="button" onClick={onPrevMonth} className="banking-glass-btn h-8 w-8 shrink-0 border-0 bg-transparent" aria-label={t("nav.prevMonth")}>
              <AppIcon icon={Icons.action.chevronLeft} size="sm" strokeWidth={2.2} className="text-white" />
            </button>
            <span className="min-w-0 flex-1 truncate px-1 text-center text-caption font-semibold">{monthLabel}</span>
            <button type="button" onClick={onNextMonth} className="banking-glass-btn h-8 w-8 shrink-0 border-0 bg-transparent" aria-label={t("nav.nextMonth")}>
              <AppIcon icon={Icons.action.chevronRight} size="sm" strokeWidth={2.2} className="text-white" />
            </button>
          </div>
          <NotificationBell
            count={notifications.length}
            onClick={() => setBellOpen(true)}
            className="banking-glass-btn h-10 w-10"
            iconClassName="text-white"
          />
        </div>

        <div className="hero-collapsible-body mb-5 px-0.5" data-onboarding="balance">
          <p className="banking-hero-label text-label mb-1.5">{t("summary.totalBalance")}</p>
          <p className="banking-hero-balance tabular-nums">
            <AnimatedCurrency value={isPositive ? balance : -Math.abs(balance)} />
          </p>
          {totalIncome > 0 && (
            <p className="banking-hero-sub mt-2 text-caption">
              {balance >= 0
                ? t("summary.savedPercent", { percent: Math.round((balance / totalIncome) * 100) })
                : t("summary.overspent", { amount: fmt(Math.abs(balance)) })}
            </p>
          )}
          <div className="mt-3">
            <HeroInsight stats={stats} prevStats={prevStats} budgets={budgets} variant="banking" />
          </div>
        </div>

        <div className="hero-collapsible-stats grid grid-cols-2 gap-2.5">
          <BankingStatGlass
            icon={<AppIcon icon={Icons.action.arrowUp} size="sm" className="text-income" strokeWidth={2.5} />}
            label={t("summary.income")}
            amount={totalIncome}
          />
          <BankingStatGlass
            icon={<AppIcon icon={Icons.action.arrowDown} size="sm" className="text-[#FCA5A5]" strokeWidth={2.5} />}
            label={t("summary.expense")}
            amount={totalExpense}
          />
        </div>
      </header>

      <DashboardMenuSheet open={menuOpen} onClose={() => setMenuOpen(false)} />
      <NotificationPanel open={bellOpen} onClose={() => setBellOpen(false)} notifications={notifications} />
    </>
  );
}

function ClassicStatCard({
  icon, label, amount, accent,
}: {
  icon: ReactNode;
  label: string;
  amount: number;
  accent: "income" | "expense";
}) {
  return (
    <div className="glass-card flex min-w-0 items-center gap-2.5 px-3 py-2.5">
      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", accent === "income" ? "bg-income/10" : "bg-coral-400/10")}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-label text-fg-muted mb-0.5">{label}</p>
        <p className="truncate text-title text-fg">
          <AnimatedCurrency value={amount} className="text-title font-semibold" />
        </p>
      </div>
    </div>
  );
}

function BankingStatGlass({ icon, label, amount }: { icon: ReactNode; label: string; amount: number }) {
  return (
    <div className="banking-stat-glass liquid-glass">
      <div className="banking-stat-icon">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="banking-stat-label">{label}</p>
        <p className="banking-stat-value truncate">
          <AnimatedCurrency value={amount} className="banking-stat-value font-semibold" />
        </p>
      </div>
    </div>
  );
}

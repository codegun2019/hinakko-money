import { useState, useMemo } from "react";
import {
  format, parseISO, addMonths, subMonths,
  getDaysInMonth, startOfMonth, getDay,
  isSameDay, isToday,
} from "date-fns";
import { th as thLocale, enUS } from "date-fns/locale";
import { OverlayPortal } from "~/components/ui/OverlayPortal";
import { useBodyScrollLock } from "~/lib/useBodyScrollLock";
import { useSettingsStore } from "~/lib/store";
import { cn } from "~/lib/format";

interface Props {
  value:     string; // YYYY-MM-DD
  onChange:  (date: string) => void;
  disabled?: boolean;
  label?:    string;
}

const WEEKDAYS_EN = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const WEEKDAYS_TH = ["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."];

function buildGrid(viewDate: Date) {
  const totalDays = getDaysInMonth(viewDate);
  const firstDay  = startOfMonth(viewDate);
  // Mon-start: Sun(0)→6, Mon(1)→0 …
  const offset    = (getDay(firstDay) + 6) % 7;
  return { totalDays, offset };
}

export function DatePicker({ value, onChange, disabled, label }: Props) {
  const language = useSettingsStore((s) => s.language);
  const locale   = language === "th" ? thLocale : enUS;

  const selectedDate = useMemo(() => (value ? parseISO(value) : new Date()), [value]);
  const [open,     setOpen]    = useState(false);
  const [viewDate, setViewDate] = useState(selectedDate);
  const [tempDate, setTempDate] = useState(selectedDate);

  useBodyScrollLock(open);

  const openPicker = () => {
    if (disabled) return;
    setTempDate(selectedDate);
    setViewDate(selectedDate);
    setOpen(true);
  };

  const handleConfirm = () => {
    onChange(format(tempDate, "yyyy-MM-dd"));
    setOpen(false);
  };

  const handleCancel = () => setOpen(false);

  const handleToday = () => {
    const now = new Date();
    setTempDate(now);
    setViewDate(now);
  };

  const goMonth = (delta: 1 | -1) =>
    setViewDate(delta === 1 ? addMonths(viewDate, 1) : subMonths(viewDate, 1));

  const { totalDays, offset } = buildGrid(viewDate);
  const weekdays = language === "th" ? WEEKDAYS_TH : WEEKDAYS_EN;
  const cells    = [...Array(offset).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)];

  const displayLabel = value
    ? format(selectedDate, language === "th" ? "d MMMM yyyy" : "d MMM yyyy", { locale })
    : "—";

  return (
    <>
      {/* Trigger row */}
      <button
        type="button"
        disabled={disabled}
        onClick={openPicker}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-xl border border-app bg-card px-3.5 py-3 min-h-[48px] transition-colors text-left",
          "active:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500/40",
          disabled && "opacity-50 pointer-events-none",
        )}
        aria-label={`${label ?? "Date"}: ${displayLabel}`}
      >
        <span className="text-body font-medium text-fg">{displayLabel}</span>
        <CalendarIcon className="shrink-0 text-fg-muted" />
      </button>

      {/* Calendar modal */}
      {open && (
        <OverlayPortal zIndex={200} align="bottom">
          {/* Backdrop */}
          <button
            type="button"
            className="absolute inset-0 bg-black/40 pointer-events-auto"
            onClick={handleCancel}
            aria-label="Close calendar"
          />

          {/* Panel */}
          <div
            role="dialog"
            aria-modal
            aria-label="Pick a date"
            className="relative w-full pointer-events-auto animate-sheet-slide-up"
          >
            <div className="mx-auto max-w-[430px] rounded-t-3xl bg-card shadow-2xl px-4 pt-4 pb-safe">

              {/* Month + year nav */}
              <div className="flex items-center justify-between mb-3 px-1">
                <button
                  type="button"
                  onClick={() => goMonth(-1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-muted active:bg-card transition-colors"
                  aria-label="Previous month"
                >
                  <ChevronLeftIcon />
                </button>

                <span className="text-title text-fg font-bold tracking-tight">
                  {format(viewDate, language === "th" ? "MMMM yyyy" : "MMMM yyyy", { locale })}
                </span>

                <button
                  type="button"
                  onClick={() => goMonth(1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-muted active:bg-card transition-colors"
                  aria-label="Next month"
                >
                  <ChevronRightIcon />
                </button>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 mb-1">
                {weekdays.map((d) => (
                  <div key={d} className="text-center text-[11px] font-semibold text-fg-muted py-1.5">
                    {d}
                  </div>
                ))}
              </div>

              {/* Day grid */}
              <div className="grid grid-cols-7 gap-y-1 mb-4">
                {cells.map((day, idx) => {
                  if (!day) return <div key={`e-${idx}`} />;

                  const dateStr  = `${format(viewDate, "yyyy-MM")}-${String(day).padStart(2, "0")}`;
                  const thisDate = parseISO(dateStr);
                  const isSelected = isSameDay(thisDate, tempDate);
                  const isTodayDay = isToday(thisDate);

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => setTempDate(thisDate)}
                      className={cn(
                        "flex flex-col items-center justify-center rounded-xl py-2 min-h-[44px] transition-all duration-150 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500/40",
                        isSelected
                          ? "bg-mint-500 text-white shadow-sm shadow-mint-500/30"
                          : isTodayDay
                            ? "ring-2 ring-mint-500/60 text-mint-600 dark:text-mint-400"
                            : "text-fg hover:bg-surface-muted active:bg-surface-muted",
                      )}
                      aria-label={format(thisDate, "d MMMM yyyy", { locale })}
                      aria-pressed={isSelected}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="h-px bg-[var(--color-border-subtle)] mb-4" />

              {/* Footer: Today + Cancel + Confirm */}
              <div className="flex items-center gap-2 pb-2">
                <button
                  type="button"
                  onClick={handleToday}
                  className="flex-shrink-0 text-sm font-semibold text-mint-500 active:opacity-70 px-2 py-2 rounded-xl transition-colors"
                >
                  {language === "th" ? "วันนี้" : "Today"}
                </button>

                <div className="flex-1" />

                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex h-10 items-center justify-center rounded-xl border border-app bg-surface-muted px-5 text-sm font-semibold text-fg transition-colors active:bg-card"
                >
                  {language === "th" ? "ยกเลิก" : "Cancel"}
                </button>

                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex h-10 items-center justify-center rounded-xl bg-mint-500 px-5 text-sm font-semibold text-white shadow-sm shadow-mint-500/25 transition-colors active:bg-mint-600"
                >
                  {language === "th" ? "ยืนยัน" : "Confirm"}
                </button>
              </div>

            </div>
          </div>
        </OverlayPortal>
      )}
    </>
  );
}

/* ── icons ─────────────────────────────────────────────────────────────────── */

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8"  y1="2" x2="8"  y2="6" />
      <line x1="3"  y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

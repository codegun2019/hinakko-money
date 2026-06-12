import { AppIcon } from "~/components/icons";
import { Icons } from "~/lib/icons";
import { useTranslation } from "~/lib/i18n";

interface Props {
  title: string;
  onPrev: () => void;
  onNext: () => void;
}

export function MonthNavHeader({ title, onPrev, onNext }: Props) {
  const { t } = useTranslation();

  return (
    <header className="safe-top shrink-0 border-b border-app bg-surface">
      <div className="flex h-12 items-center justify-between gap-2 px-4">
        <button type="button" onClick={onPrev} className="icon-btn h-9 w-9 shrink-0" aria-label={t("nav.prevMonth")}>
          <AppIcon icon={Icons.action.chevronLeft} size="md" className="text-fg" strokeWidth={2.2} />
        </button>
        <span className="min-w-0 flex-1 truncate px-2 text-center text-title text-fg">{title}</span>
        <button type="button" onClick={onNext} className="icon-btn h-9 w-9 shrink-0" aria-label={t("nav.nextMonth")}>
          <AppIcon icon={Icons.action.chevronRight} size="md" className="text-fg" strokeWidth={2.2} />
        </button>
      </div>
    </header>
  );
}

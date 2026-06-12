import { Link } from "@tanstack/react-router";
import { BottomSheet } from "~/components/ui/BottomSheet";
import { Icons } from "~/lib/icons";
import { AppIcon } from "~/components/icons";
import { useTranslation } from "~/lib/i18n";
import type { TranslationKey } from "~/lib/i18n";

interface Props {
  open: boolean;
  onClose: () => void;
}

const LINKS: { to: "/" | "/calendar" | "/categories" | "/settings"; icon: keyof typeof Icons.nav; labelKey: TranslationKey }[] = [
  { to: "/",           icon: "dashboard", labelKey: "menu.dashboard" },
  { to: "/calendar",   icon: "calendar",  labelKey: "menu.calendar" },
  { to: "/categories", icon: "report",    labelKey: "menu.reports" },
  { to: "/settings",   icon: "settings",  labelKey: "menu.settings" },
];

export function DashboardMenuSheet({ open, onClose }: Props) {
  const { t } = useTranslation();

  return (
    <BottomSheet open={open} onClose={onClose} title={t("menu.title")} description={t("menu.description")}>
      <div className="flex flex-col gap-2 pb-2">
        {LINKS.map(({ to, icon, labelKey }) => (
          <Link
            key={to}
            to={to}
            onClick={onClose}
            className="flex min-h-[48px] items-center gap-3 rounded-xl border border-app bg-card px-3.5 py-2.5 active:bg-surface-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500/40"
          >
            <AppIcon icon={Icons.nav[icon]} size="md" className="text-fg-muted" />
            <span className="text-body font-semibold text-fg">{t(labelKey)}</span>
            <AppIcon icon={Icons.action.chevronRight} size="sm" className="ml-auto text-fg-subtle" />
          </Link>
        ))}
      </div>
    </BottomSheet>
  );
}

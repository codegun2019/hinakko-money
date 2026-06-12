import { BottomSheet } from "~/components/ui/BottomSheet";
import { EmptyState } from "~/components/ui/EmptyState";
import { AppIcon } from "~/components/icons";
import { Icons } from "~/lib/icons";
import { getCategoryName, useTranslation } from "~/lib/i18n";
import type { AppNotification } from "~/lib/notifications";
import { cn } from "~/lib/format";

interface Props {
  open:          boolean;
  onClose:       () => void;
  notifications: AppNotification[];
}

const SEVERITY_CLASS = {
  info:    "border-app bg-card",
  warning: "border-amber-500/25 bg-amber-500/8",
  danger:  "border-coral-400/30 bg-coral-400/8",
} as const;

export function NotificationPanel({ open, onClose, notifications }: Props) {
  const { t, language } = useTranslation();

  const resolveParams = (item: AppNotification) => {
    const params = { ...item.params };
    if (params.categoryId) {
      params.category = getCategoryName(String(params.categoryId), language);
      delete params.categoryId;
    }
    return params as Record<string, string | number>;
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={t("notifications.title")}>
      {notifications.length === 0 ? (
        <EmptyState
          compact
          icon={<AppIcon icon={Icons.action.bell} size="xl" className="text-fg-subtle" strokeWidth={1.5} />}
          title={t("notifications.emptyTitle")}
          description={t("notifications.emptyDesc")}
        />
      ) : (
        <div className="flex flex-col gap-2 pb-2">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex gap-3 rounded-xl border px-3.5 py-3",
                SEVERITY_CLASS[item.severity],
              )}
            >
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-muted">
                <AppIcon
                  icon={item.severity === "danger" ? Icons.action.arrowDown : Icons.action.bell}
                  size="sm"
                  className={item.severity === "danger" ? "text-coral-400" : "text-primary"}
                />
              </div>
              <div className="min-w-0">
                <p className="text-body font-semibold text-fg">{t(item.titleKey, resolveParams(item))}</p>
                <p className="mt-0.5 text-caption text-fg-muted">{t(item.descKey, resolveParams(item))}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </BottomSheet>
  );
}

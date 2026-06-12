import { AppIcon } from "~/components/icons";
import { LoadingSpinner } from "~/components/ui/LoadingSpinner";
import { Icons } from "~/lib/icons";
import { useTranslation } from "~/lib/i18n";
import { cn } from "~/lib/format";

interface Props {
  visible: boolean;
  leaving: boolean;
}

export function AppBootSplash({ visible, leaving }: Props) {
  const { t } = useTranslation();

  if (!visible) return null;

  return (
    <div
      className={cn("boot-splash", leaving && "is-leaving")}
      role="status"
      aria-live="polite"
      aria-busy={!leaving}
      aria-label={t("splash.loading")}
    >
      <div className="boot-splash-frame bg-app">
        <div className="boot-splash-glow pointer-events-none" aria-hidden />
        <div className="boot-splash-logo animate-scale-in">
          <AppIcon icon={Icons.brand.cat} size="xl" className="text-primary" strokeWidth={2} />
        </div>
        <p className="boot-splash-title text-title text-fg">{t("meta.appTitle")}</p>
        <p className="boot-splash-tagline text-caption text-fg-muted">{t("splash.tagline")}</p>
        <LoadingSpinner size="md" className="mt-8" label={t("splash.loading")} />
      </div>
    </div>
  );
}

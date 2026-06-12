import { Link } from "@tanstack/react-router";
import { WifiOff, RefreshCw, LayoutDashboard } from "lucide-react";
import { Button } from "~/components/ui/Button";
import { AppIcon } from "~/components/icons";
import { useTranslation } from "~/lib/i18n";

interface Props {
  onRetry?: () => void;
  compact?: boolean;
}

export function OfflineFallback({ onRetry, compact = false }: Props) {
  const { t } = useTranslation();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center text-center animate-fade-in ${compact ? "px-6 py-10" : "px-8 py-16 pb-nav"}`}>
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-surface-muted ring-1 ring-[var(--color-border-subtle)]">
        <AppIcon icon={WifiOff} size="xl" className="text-fg-muted" strokeWidth={1.5} />
      </div>
      <h2 className="text-headline text-fg mb-2">{t("pwa.offlineTitle")}</h2>
      <p className="text-body text-fg-muted max-w-[280px] leading-relaxed mb-6">
        {t("pwa.offlineDesc")}
      </p>
      <div className="flex flex-col gap-2.5 w-full max-w-[280px]">
        <Button variant="primary" size="lg" fullWidth onClick={handleRetry}>
          <AppIcon icon={RefreshCw} size="sm" className="text-white" />
          {t("pwa.retry")}
        </Button>
        <Link to="/" className="w-full">
          <Button variant="ghost" size="lg" fullWidth type="button">
            <AppIcon icon={LayoutDashboard} size="sm" />
            {t("pwa.backDashboard")}
          </Button>
        </Link>
      </div>
    </div>
  );
}

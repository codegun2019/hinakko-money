import { useEffect, useState } from "react";
import { Button } from "~/components/ui/Button";
import { AppIcon } from "~/components/icons";
import { Icons } from "~/lib/icons";
import { useTranslation } from "~/lib/i18n";
import { useSettingsStore } from "~/lib/store";
import { cn } from "~/lib/format";

const INSTALL_MIN_SAVES = 3;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPromptBanner() {
  const { t } = useTranslation();
  const saveCount = useSettingsStore((s) => s.transactionSaveCount);
  const dismissed = useSettingsStore((s) => s.installPromptDismissed);
  const dismissInstallPrompt = useSettingsStore((s) => s.dismissInstallPrompt);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installing, setInstalling] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (import.meta.env.SSR) return;
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches
      || (window.navigator as Navigator & { standalone?: boolean }).standalone;
    if (standalone) return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  const visible = Boolean(deferred)
    && !dismissed
    && !hidden
    && saveCount >= INSTALL_MIN_SAVES;

  if (!visible) return null;

  const handleInstall = async () => {
    if (!deferred) return;
    setInstalling(true);
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") setHidden(true);
      else dismissInstallPrompt();
    } finally {
      setInstalling(false);
      setDeferred(null);
    }
  };

  return (
    <div className="install-prompt safe-bottom pointer-events-none fixed inset-x-0 bottom-[calc(var(--nav-bar-height)+var(--nav-fab-overhang)+env(safe-area-inset-bottom,0px))] z-[45] flex justify-center px-3">
      <div className="app-frame px-0">
        <div className={cn("install-prompt-card pointer-events-auto glass-card flex w-full items-start gap-3 rounded-2xl border border-app p-3.5 shadow-card-hover animate-slide-up")}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mint-500/12">
          <AppIcon icon={Icons.settings.version} size="md" className="text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-body font-semibold text-fg">{t("pwa.installTitle")}</p>
          <p className="mt-0.5 text-caption text-fg-muted">{t("pwa.installDesc")}</p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" loading={installing} disabled={installing} onClick={() => { void handleInstall(); }}>
              {t("pwa.installAction")}
            </Button>
            <Button size="sm" variant="ghost" disabled={installing} onClick={dismissInstallPrompt}>
              {t("pwa.installDismiss")}
            </Button>
          </div>
        </div>
        <button
          type="button"
          className="icon-btn h-8 w-8 shrink-0"
          aria-label={t("toast.dismiss")}
          onClick={dismissInstallPrompt}
        >
          <AppIcon icon={Icons.action.close} size="sm" />
        </button>
      </div>
      </div>
    </div>
  );
}

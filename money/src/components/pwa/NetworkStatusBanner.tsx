import { useEffect, useRef, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { useOnlineStatus } from "~/lib/useOnlineStatus";
import { getQueueLength } from "~/lib/offline-queue";
import { AppIcon } from "~/components/icons";
import { useTranslation } from "~/lib/i18n";

const BACK_ONLINE_MS = 3000;

export function NetworkStatusBanner() {
  const { t } = useTranslation();
  const online = useOnlineStatus();
  const pendingCount = getQueueLength();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [isOffline, setIsOffline] = useState(false);
  const prevOnline = useRef(online);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (prevOnline.current === online) return;
    prevOnline.current = online;

    if (hideTimer.current) clearTimeout(hideTimer.current);

    if (!online) {
      setMessage(
        pendingCount > 0
          ? t("pwa.offlinePendingBanner", { count: pendingCount })
          : t("pwa.offlineBanner"),
      );
      setIsOffline(true);
      setVisible(true);
      return;
    }

    setMessage(t("pwa.onlineBanner"));
    setIsOffline(false);
    setVisible(true);
    hideTimer.current = setTimeout(() => setVisible(false), BACK_ONLINE_MS);
  }, [online, t, pendingCount]);

  useEffect(() => () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="app-frame-fixed top-0 z-50 safe-top px-3 pt-2 pointer-events-none animate-slide-up"
    >
      <div
        className={`mx-auto flex w-full max-w-[400px] items-center gap-2.5 rounded-2xl px-3.5 py-2.5 shadow-sm border ${
          isOffline
            ? "bg-card/95 text-fg border-app backdrop-blur-md"
            : "bg-income text-white border-transparent"
        }`}
      >
        <AppIcon
          icon={isOffline ? WifiOff : Wifi}
          size="sm"
          className={isOffline ? "text-fg-muted shrink-0" : "text-white shrink-0"}
        />
        <p className="text-caption font-medium leading-snug">{message}</p>
      </div>
    </div>
  );
}

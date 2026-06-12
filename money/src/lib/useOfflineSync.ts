import { useEffect, useRef } from "react";
import { useRouter } from "@tanstack/react-router";
import { syncOfflineTransactions } from "~/lib/transactions-client";
import { useOnlineStatus } from "~/lib/useOnlineStatus";
import { showToast, showErrorToast } from "~/lib/toast";
import { useTranslation } from "~/lib/i18n";

export function useOfflineSync(): void {
  const online = useOnlineStatus();
  const router = useRouter();
  const { t } = useTranslation();
  const syncing = useRef(false);
  const prevOnline = useRef(online);

  useEffect(() => {
    if (!online || prevOnline.current === online) {
      prevOnline.current = online;
      return;
    }
    prevOnline.current = online;

    if (syncing.current) return;
    syncing.current = true;

    void (async () => {
      try {
        const { synced, failed } = await syncOfflineTransactions();
        if (synced > 0) {
          await router.invalidate();
          showToast(t("pwa.syncSuccess", { count: synced }), "success");
        }
        if (failed > 0) {
          showErrorToast(t("pwa.syncFailed", { count: failed }));
        }
      } finally {
        syncing.current = false;
      }
    })();
  }, [online, router, t]);
}

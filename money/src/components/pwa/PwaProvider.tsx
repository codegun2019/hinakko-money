import { useCallback, useEffect, useState, type ReactNode } from "react";
import { InstallPromptBanner } from "~/components/pwa/InstallPromptBanner";
import { NetworkStatusBanner } from "~/components/pwa/NetworkStatusBanner";
import { UpdateAvailableSheet } from "~/components/pwa/UpdateAvailableSheet";

import { useOfflineSync } from "~/lib/useOfflineSync";

interface Props {
  children: ReactNode;
}

export function PwaProvider({ children }: Props) {
  useOfflineSync();
  const [updateOpen, setUpdateOpen] = useState(false);
  const [refreshing, setRefreshing]   = useState(false);

  useEffect(() => {
    if (import.meta.env.SSR || !("serviceWorker" in navigator)) return;

    const onUpdateFound = (reg: ServiceWorkerRegistration) => {
      const worker = reg.installing;
      if (!worker) return;
      worker.addEventListener("statechange", () => {
        if (worker.state === "installed" && navigator.serviceWorker.controller) {
          setUpdateOpen(true);
        }
      });
    };

    void navigator.serviceWorker.ready.then((reg) => {
      if (reg.waiting) setUpdateOpen(true);
      reg.addEventListener("updatefound", () => onUpdateFound(reg));
    });
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg.waiting) {
        reg.waiting.postMessage({ type: "SKIP_WAITING" });
        await new Promise<void>((resolve) => {
          navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true });
        });
      }
      window.location.reload();
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <>
      {children}
      <NetworkStatusBanner />
      <InstallPromptBanner />
      <UpdateAvailableSheet
        open={updateOpen}
        onRefresh={() => { void handleRefresh(); }}
        onDismiss={() => setUpdateOpen(false)}
        loading={refreshing}
      />
    </>
  );
}

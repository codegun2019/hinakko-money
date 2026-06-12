import { createFileRoute } from "@tanstack/react-router";
import { OfflineFallback } from "~/components/pwa/OfflineFallback";

export const Route = createFileRoute("/offline")({
  component: OfflinePage,
});

function OfflinePage() {
  return (
    <div className="flex h-full min-h-0 flex-col bg-app">
      <OfflineFallback />
    </div>
  );
}

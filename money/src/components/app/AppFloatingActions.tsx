import { useRouterState } from "@tanstack/react-router";
import { AccentColorFab } from "~/components/app/AccentColorFab";
import { ScrollToTopButton } from "~/components/app/ScrollToTopButton";

const HIDE_PATHS = ["/add", "/edit"];

export function AppFloatingActions() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hidden = HIDE_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (hidden) return null;

  return (
    <div className="app-floating-actions safe-bottom pointer-events-none">
      <ScrollToTopButton />
      <AccentColorFab />
    </div>
  );
}

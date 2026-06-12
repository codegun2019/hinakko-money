import { createPortal } from "react-dom";
import type { ReactNode } from "react";

const OVERLAY_ROOT_ID = "overlay-root";

export function getOverlayRoot(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return document.getElementById(OVERLAY_ROOT_ID) ?? document.body;
}

interface Props {
  children: ReactNode;
  /** z-index layer — sheets 100, onboarding 200 */
  zIndex?: number;
  /** bottom = sheet slide-up; center = dialog */
  align?: "bottom" | "center";
}

/** Portal overlays to document root — consistent dim + max-width frame on all pages. */
export function OverlayPortal({ children, zIndex = 100, align = "bottom" }: Props) {
  const frameClass =
    align === "center"
      ? "app-frame relative flex h-full flex-col items-center justify-center pointer-events-none"
      : "app-frame relative flex h-full flex-col justify-end pointer-events-none";

  const shell = (
    <div
      className="overlay-portal fixed inset-0 flex justify-center pointer-events-none"
      style={{ zIndex }}
    >
      <div className={frameClass}>{children}</div>
    </div>
  );

  const root = getOverlayRoot();
  if (!root) return shell;
  return createPortal(shell, root);
}

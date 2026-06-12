import type { ReactNode } from "react";
import { Button } from "~/components/ui/Button";
import { OverlayPortal } from "~/components/ui/OverlayPortal";
import { useBodyScrollLock } from "~/lib/useBodyScrollLock";

interface Props {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
  children,
}: Props) {
  useBodyScrollLock(open);

  if (!open) return null;

  return (
    <OverlayPortal zIndex={110} align="bottom">
      <button
        type="button"
        className="sheet-backdrop absolute inset-0 pointer-events-auto"
        onClick={onCancel}
        aria-label="Close dialog"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby={description ? "confirm-dialog-desc" : undefined}
        className="relative w-full card-surface-elevated rounded-t-3xl p-6 pb-safe animate-sheet-slide-up pointer-events-auto"
      >
        <h2 id="confirm-dialog-title" className="text-headline text-fg mb-1">
          {title}
        </h2>
        {description && (
          <p id="confirm-dialog-desc" className="text-body text-fg-muted mb-4">{description}</p>
        )}
        {children}
        <div className="flex gap-3 mt-5">
          <Button variant="ghost" size="lg" fullWidth onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant="secondary" size="lg" fullWidth loading={loading} disabled={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </OverlayPortal>
  );
}

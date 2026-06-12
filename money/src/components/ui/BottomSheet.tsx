import { useEffect, type ReactNode } from "react";
import { OverlayPortal } from "~/components/ui/OverlayPortal";
import { useBodyScrollLock } from "~/lib/useBodyScrollLock";
import { useSheetDrag } from "~/lib/useSheetDrag";
import { haptic } from "~/lib/haptics";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
}

export function BottomSheet({ open, onClose, title, description, children }: Props) {
  useBodyScrollLock(open);

  const { sheetStyle, backdropStyle, resetDrag, handleProps } = useSheetDrag({
    onDismiss: onClose,
    enabled: open,
  });

  useEffect(() => {
    if (open) {
      haptic("light");
      resetDrag();
    }
  }, [open, resetDrag]);

  if (!open) return null;

  return (
    <OverlayPortal zIndex={100} align="bottom">
      <button
        type="button"
        className="sheet-backdrop absolute inset-0 pointer-events-auto"
        style={backdropStyle}
        onClick={onClose}
        aria-label="Close"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bottom-sheet-title"
        className="sheet-panel relative flex w-full max-h-[min(85dvh,calc(100dvh-env(safe-area-inset-top,0px)-0.5rem))] flex-col card-surface-elevated rounded-t-2xl animate-sheet-slide-up pointer-events-auto"
        style={sheetStyle}
      >
        <div className="sheet-handle-area shrink-0 px-5 pt-3 pb-3" {...handleProps}>
          <div className="sheet-handle mx-auto mb-3" aria-hidden />
          <h2 id="bottom-sheet-title" className="text-headline text-fg truncate">{title}</h2>
          {description && (
            <p className="text-body text-fg-muted mt-1 line-clamp-2">{description}</p>
          )}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain no-scrollbar px-5 pb-safe">
          {children}
        </div>
      </div>
    </OverlayPortal>
  );
}

interface OptionProps {
  selected: boolean;
  onClick: () => void;
  label: string;
  description?: string;
}

export function SheetOption({ selected, onClick, label, description }: OptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full min-h-[48px] items-center gap-3 rounded-xl px-3.5 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500/40 ${
        selected
          ? "border border-mint-500/30 bg-mint-500/10"
          : "border border-app bg-card active:bg-surface-muted"
      }`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-body font-semibold text-fg truncate">{label}</p>
        {description && (
          <p className="text-caption text-fg-muted line-clamp-2">{description}</p>
        )}
      </div>
      {selected && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  );
}

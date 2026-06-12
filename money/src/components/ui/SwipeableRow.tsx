import { useCallback, useRef, useState, type ReactNode } from "react";
import { AppIcon } from "~/components/icons";
import { Icons } from "~/lib/icons";
import { haptic } from "~/lib/haptics";
import { prefersReducedMotion, springTransition } from "~/lib/motion";
import { cn } from "~/lib/format";

const ACTION_W = 76;
const SNAP = 52;

interface Props {
  children:        ReactNode;
  editLabel?:      string;
  deleteLabel?:    string;
  duplicateLabel?: string;
  onEdit?:         () => void;
  onDelete?:       () => void;
  onDuplicate?:    () => void;
  className?:      string;
}

export function SwipeableRow({
  children,
  editLabel = "Edit",
  deleteLabel = "Delete",
  duplicateLabel = "Copy",
  onEdit,
  onDelete,
  onDuplicate,
  className,
}: Props) {
  const enabled = Boolean(onEdit || onDelete || onDuplicate) && !prefersReducedMotion();
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const baseOffset = useRef(0);
  const axis = useRef<"x" | "y" | null>(null);
  const moved = useRef(false);
  const suppressClick = useRef(false);

  const rightActions = Number(Boolean(onDuplicate)) + Number(Boolean(onEdit));
  const maxLeft  = onDelete ? -ACTION_W : 0;
  const maxRight = rightActions * ACTION_W;

  const clamp = useCallback(
    (value: number) => Math.max(maxLeft, Math.min(maxRight, value)),
    [maxLeft, maxRight],
  );

  const snapOffset = useCallback(
    (value: number) => {
      if (value <= -SNAP && onDelete) return -ACTION_W;
      if (value >= SNAP && maxRight > 0) return maxRight;
      return 0;
    },
    [maxRight, onDelete],
  );

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled) return;
    axis.current = null;
    moved.current = false;
    startX.current = e.clientX;
    startY.current = e.clientY;
    baseOffset.current = offset;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || !enabled) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;

    if (axis.current === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      axis.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
    if (axis.current !== "x") return;

    moved.current = true;
    setOffset(clamp(baseOffset.current + dx));
  };

  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    if (axis.current === "x" && moved.current) {
      suppressClick.current = true;
      const snapped = snapOffset(offset);
      if (snapped !== offset) haptic("selection");
      setOffset(snapped);
    }
    axis.current = null;
  };

  const close = () => setOffset(0);

  const triggerEdit = () => {
    haptic("light");
    close();
    onEdit?.();
  };

  const triggerDuplicate = () => {
    haptic("light");
    close();
    onDuplicate?.();
  };

  const triggerDelete = () => {
    haptic("medium");
    close();
    onDelete?.();
  };

  if (!enabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn("swipe-row", className)}>
      <div className="swipe-row-actions" aria-hidden={offset === 0}>
        {onDuplicate && (
          <button
            type="button"
            className="swipe-action swipe-action-duplicate"
            tabIndex={offset > 0 ? 0 : -1}
            aria-label={duplicateLabel}
            onClick={triggerDuplicate}
          >
            <AppIcon icon={Icons.action.copy} size="sm" />
            <span>{duplicateLabel}</span>
          </button>
        )}
        {onEdit && (
          <button
            type="button"
            className="swipe-action swipe-action-edit"
            tabIndex={offset > 0 ? 0 : -1}
            aria-label={editLabel}
            onClick={triggerEdit}
          >
            <AppIcon icon={Icons.action.chevronRight} size="sm" className="rotate-180" />
            <span>{editLabel}</span>
          </button>
        )}
        <div className="swipe-row-spacer" />
        {onDelete && (
          <button
            type="button"
            className="swipe-action swipe-action-delete"
            tabIndex={offset < 0 ? 0 : -1}
            aria-label={deleteLabel}
            onClick={triggerDelete}
          >
            <AppIcon icon={Icons.action.trash} size="sm" />
            <span>{deleteLabel}</span>
          </button>
        )}
      </div>

      <div
        className={cn("swipe-row-front bg-card", dragging && "is-dragging")}
        style={{
          transform: `translateX(${offset}px)`,
          transition: dragging ? "none" : springTransition("transform", 280),
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={(e) => {
          if (suppressClick.current) {
            suppressClick.current = false;
            e.stopPropagation();
            e.preventDefault();
          }
        }}
      >
        {children}
      </div>
    </div>
  );
}

import { useCallback, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { haptic } from "~/lib/haptics";
import { prefersReducedMotion, springTransition } from "~/lib/motion";

const DISMISS_THRESHOLD = 88;
const MAX_DRAG = 420;

interface Options {
  onDismiss: () => void;
  enabled?:  boolean;
}

export function useSheetDrag({ onDismiss, enabled = true }: Options) {
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);
  const lastY = useRef(0);

  const resetDrag = useCallback(() => {
    setDragging(false);
    setDragY(0);
  }, []);

  const onHandlePointerDown = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    if (!enabled || prefersReducedMotion()) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    startY.current = e.clientY;
    lastY.current = 0;
    setDragging(true);
  }, [enabled]);

  const onHandlePointerMove = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    if (!dragging) return;
    const delta = Math.max(0, e.clientY - startY.current);
    lastY.current = delta;
    setDragY(Math.min(delta, MAX_DRAG));
  }, [dragging]);

  const onHandlePointerUp = useCallback(() => {
    if (!dragging) return;
    const shouldDismiss = lastY.current >= DISMISS_THRESHOLD;
    setDragging(false);
    if (shouldDismiss) {
      haptic("light");
      onDismiss();
      setDragY(0);
      return;
    }
    setDragY(0);
  }, [dragging, onDismiss]);

  const backdropAlpha = Math.max(0.08, 0.44 - dragY / 360);

  const sheetStyle: CSSProperties = {
    transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
    transition: dragging || dragY > 0 ? (dragging ? "none" : springTransition("transform")) : undefined,
  };

  const backdropStyle = {
    "--sheet-backdrop-alpha": String(backdropAlpha),
  } as CSSProperties;

  return {
    dragY,
    dragging,
    sheetStyle,
    backdropStyle,
    resetDrag,
    handleProps: {
      onPointerDown: onHandlePointerDown,
      onPointerMove: onHandlePointerMove,
      onPointerUp: onHandlePointerUp,
      onPointerCancel: onHandlePointerUp,
    },
  };
}

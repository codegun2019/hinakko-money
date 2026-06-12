import { useCallback, useLayoutEffect, useRef, useState } from "react";

export interface SegmentIndicatorStyle {
  left:    number;
  top:     number;
  width:   number;
  height:  number;
  opacity: number;
}

export function useSegmentIndicator(activeKey: string) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef(new Map<string, HTMLElement>());
  const [indicator, setIndicator] = useState<SegmentIndicatorStyle>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    opacity: 0,
  });

  const setItemRef = useCallback(
    (key: string) => (el: HTMLElement | null) => {
      if (el) itemRefs.current.set(key, el);
      else itemRefs.current.delete(key);
    },
    [],
  );

  const rafRef = useRef(0);

  const measure = useCallback(() => {
    const container = containerRef.current;
    const el = itemRefs.current.get(activeKey);
    if (!container || !el) return;

    const cRect = container.getBoundingClientRect();
    const eRect = el.getBoundingClientRect();
    const next: SegmentIndicatorStyle = {
      left: eRect.left - cRect.left + container.scrollLeft,
      top: eRect.top - cRect.top + container.scrollTop,
      width: eRect.width,
      height: eRect.height,
      opacity: 1,
    };

    setIndicator((prev) =>
      prev.left === next.left
        && prev.top === next.top
        && prev.width === next.width
        && prev.height === next.height
        && prev.opacity === next.opacity
        ? prev
        : next,
    );
  }, [activeKey]);

  const scheduleMeasure = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(measure);
  }, [measure]);

  useLayoutEffect(() => {
    scheduleMeasure();
    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver(scheduleMeasure);
    ro.observe(container);
    for (const el of itemRefs.current.values()) ro.observe(el);
    container.addEventListener("scroll", scheduleMeasure, { passive: true });
    window.addEventListener("resize", scheduleMeasure);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      container.removeEventListener("scroll", scheduleMeasure);
      window.removeEventListener("resize", scheduleMeasure);
    };
  }, [scheduleMeasure, activeKey]);

  return { containerRef, setItemRef, indicator };
}

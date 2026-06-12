import { useEffect, useRef, useState } from "react";

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useAnimatedNumber(target: number, duration = 480): number {
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (prefersReducedMotion()) {
      fromRef.current = target;
      setDisplay(target);
      return;
    }

    const from = fromRef.current;
    if (from === target) return;

    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const next = from + (target - from) * easeOutCubic(progress);
      setDisplay(next);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
        setDisplay(target);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return display;
}

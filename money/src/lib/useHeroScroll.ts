import { useEffect, useRef, useState } from "react";
import { getScrollContainer, subscribeScrollContainer } from "~/lib/scroll-container";
import { prefersReducedMotion } from "~/lib/motion";

const COLLAPSE_RANGE = 150;

export function useHeroScroll() {
  const heroRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    let attached: HTMLElement | null = null;

    const measure = () => {
      const el = attached;
      if (!el) return;

      if (prefersReducedMotion()) {
        setProgress(0);
        setCompact(false);
        heroRef.current?.style.removeProperty("--hero-progress");
        el.dataset.heroCompact = "false";
        return;
      }

      const y = el.scrollTop;
      const p = Math.min(1, y / COLLAPSE_RANGE);
      setProgress(p);
      setCompact(y >= COLLAPSE_RANGE * 0.82);
      heroRef.current?.style.setProperty("--hero-progress", p.toFixed(3));
      el.dataset.heroCompact = y >= COLLAPSE_RANGE * 0.82 ? "true" : "false";
    };

    const bind = (el: HTMLElement | null) => {
      attached?.removeEventListener("scroll", measure);
      attached = el;
      attached?.addEventListener("scroll", measure, { passive: true });
      measure();
    };

    bind(getScrollContainer());
    return subscribeScrollContainer(() => bind(getScrollContainer()));
  }, []);

  return { heroRef, progress, compact };
}

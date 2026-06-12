import { useEffect, useState } from "react";

type Listener = () => void;

let scrollEl: HTMLElement | null = null;
const listeners = new Set<Listener>();

export function setScrollContainer(el: HTMLElement | null) {
  scrollEl = el;
  listeners.forEach((fn) => fn());
}

export function getScrollContainer(): HTMLElement | null {
  return scrollEl;
}

export function subscribeScrollContainer(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useScrollContainer(): HTMLElement | null {
  const [el, setEl] = useState<HTMLElement | null>(() => scrollEl);

  useEffect(() => {
    setEl(scrollEl);
    return subscribeScrollContainer(() => setEl(scrollEl));
  }, []);

  return el;
}

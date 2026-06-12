import { useEffect, useState } from "react";

const MIN_VISIBLE_MS = 650;
const FADE_MS = 320;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useAppBootSplash() {
  const [phase, setPhase] = useState<"visible" | "leaving" | "hidden">("visible");

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const started = performance.now();

    const beginExit = () => {
      const minMs = reduced ? 0 : MIN_VISIBLE_MS;
      const elapsed = performance.now() - started;
      const delay = Math.max(0, minMs - elapsed);
      window.setTimeout(() => setPhase("leaving"), delay);
    };

    if (document.readyState === "complete") beginExit();
    else window.addEventListener("load", beginExit, { once: true });

    return () => window.removeEventListener("load", beginExit);
  }, []);

  useEffect(() => {
    if (phase !== "leaving") return;
    const fadeMs = prefersReducedMotion() ? 0 : FADE_MS;
    const timer = window.setTimeout(() => setPhase("hidden"), fadeMs);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    const el = document.getElementById("static-boot-splash");
    if (el) el.remove();
  }, []);

  return {
    visible: phase !== "hidden",
    leaving: phase === "leaving",
  };
}

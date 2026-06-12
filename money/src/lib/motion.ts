/** Shared motion tokens — iOS-like spring feel */
export const SPRING_EASE = "cubic-bezier(0.34, 1.28, 0.64, 1)";
export const SPRING_SOFT = "cubic-bezier(0.22, 1, 0.36, 1)";

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function springTransition(property = "all", durationMs = 320): string {
  if (prefersReducedMotion()) return `${property} 0.01ms linear`;
  return `${property} ${durationMs}ms ${SPRING_EASE}`;
}

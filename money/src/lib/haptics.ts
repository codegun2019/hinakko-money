export type HapticPattern = "light" | "medium" | "success" | "warning" | "selection";

const PATTERNS: Record<HapticPattern, number | number[]> = {
  light:     8,
  medium:    16,
  success:   [8, 40, 12],
  warning:   [12, 36, 12],
  selection: 6,
};

let canVibrate: boolean | null = null;

function isVibrationSupported(): boolean {
  if (canVibrate !== null) return canVibrate;
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") {
    canVibrate = false;
    return false;
  }
  if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    canVibrate = false;
    return false;
  }
  canVibrate = true;
  return true;
}

/** Fire after paint so navigation / layout is not blocked by Vibration API. */
export function haptic(pattern: HapticPattern = "light"): void {
  if (!isVibrationSupported()) return;
  const pulse = PATTERNS[pattern];
  requestAnimationFrame(() => {
    try {
      navigator.vibrate(0);
      navigator.vibrate(pulse);
    } catch {
      canVibrate = false;
    }
  });
}

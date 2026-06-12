import type { ThemeTemplateId } from "./index";

export type ThemeColorMode = "light" | "dark";

/** CSS custom properties applied inline on <html> — guarantees template switch works. */
export type ThemeTokenMap = Record<string, string>;

const DEFAULT_LIGHT: ThemeTokenMap = {
  "--color-cream":         "#FFFFFF",
  "--color-surface":       "#FFFFFF",
  "--color-surface-muted": "#EEF1F6",
  "--color-card":          "#FFFFFF",
  "--color-border-subtle": "#E2E8F0",
  "--color-fg":            "#0F172A",
  "--color-fg-secondary":  "#334155",
  "--color-fg-muted":      "#64748B",
  "--color-fg-subtle":     "#94A3B8",
  "--color-primary":       "#4F8CFF",
  "--color-primary-muted": "rgba(79, 140, 255, 0.12)",
  "--color-active":        "#4F8CFF",
  "--color-active-muted":  "rgba(79, 140, 255, 0.12)",
  "--color-mint-400":      "#60A5FA",
  "--color-mint-500":      "#4F8CFF",
  "--color-mint-600":      "#3B76E0",
  "--color-mint-700":      "#2563EB",
  "--radius-app":          "0.875rem",
  "--radius-card":         "0.875rem",
  "--shadow-card":         "0 1px 0 rgba(15, 23, 42, 0.04)",
  "--shadow-card-hover":   "0 4px 12px rgba(15, 23, 42, 0.06)",
  "--shadow-fab":          "0 4px 12px rgba(79, 140, 255, 0.35)",
  "--display-size":        "1.75rem",
  "--gradient-hero":       "none",
  "--gradient-fab":        "none",
};

const DEFAULT_DARK: ThemeTokenMap = {
  ...DEFAULT_LIGHT,
  "--color-cream":         "#0F1115",
  "--color-surface":       "#171A21",
  "--color-surface-muted": "#1E222B",
  "--color-card":          "#1E222B",
  "--color-border-subtle": "#2A3140",
  "--color-fg":            "#FFFFFF",
  "--color-fg-secondary":  "#E2E8F0",
  "--color-fg-muted":      "#94A3B8",
  "--color-fg-subtle":     "#64748B",
  "--shadow-card":         "0 1px 0 rgba(255, 255, 255, 0.04)",
  "--shadow-card-hover":   "0 4px 16px rgba(0, 0, 0, 0.25)",
  "--shadow-fab":          "0 4px 14px rgba(79, 140, 255, 0.28)",
};

/** Wallet + banking hybrid — deep navy, blue hero gradient, glass surfaces (TrueMoney × Revolut). */
const BANKING_LIGHT: ThemeTokenMap = {
  "--color-cream":         "#FFFFFF",
  "--color-surface":       "#FFFFFF",
  "--color-surface-muted": "#F1F5F9",
  "--color-card":          "#FFFFFF",
  "--color-border-subtle": "#E2E8F0",
  "--color-fg":            "#0F172A",
  "--color-fg-secondary":  "#334155",
  "--color-fg-muted":      "#64748B",
  "--color-fg-subtle":     "#94A3B8",
  "--color-primary":       "#2563EB",
  "--color-primary-muted": "rgba(37, 99, 235, 0.10)",
  "--color-active":        "#2563EB",
  "--color-active-muted":  "rgba(37, 99, 235, 0.10)",
  "--color-accent-warm":   "#EA580C",
  "--color-mint-400":      "#3B82F6",
  "--color-mint-500":      "#2563EB",
  "--color-mint-600":      "#1D4ED8",
  "--color-mint-700":      "#1E40AF",
  "--radius-app":          "1.5rem",
  "--radius-card":         "1.75rem",
  "--shadow-card":         "0 1px 0 rgba(255,255,255,0.85) inset, 0 10px 28px rgba(15, 23, 42, 0.08)",
  "--shadow-card-hover":   "0 1px 0 rgba(255,255,255,0.9) inset, 0 16px 40px rgba(15, 23, 42, 0.12)",
  "--shadow-fab":          "0 10px 32px rgba(37, 99, 235, 0.38), 0 2px 0 rgba(255,255,255,0.25) inset",
  "--display-size":        "2.125rem",
  "--gradient-hero":       "linear-gradient(155deg, #1D4ED8 0%, #2563EB 48%, #0284C7 100%)",
  "--gradient-fab":          "linear-gradient(135deg, #3B82F6 0%, #2563EB 55%, #1D4ED8 100%)",
  "--nav-bar-height":      "3.25rem",
};

const BANKING_DARK: ThemeTokenMap = {
  "--color-cream":         "#06080D",
  "--color-surface":       "#0C1018",
  "--color-surface-muted": "#141A24",
  "--color-card":          "#121820",
  "--color-border-subtle": "rgba(255, 255, 255, 0.07)",
  "--color-fg":            "#F8FAFC",
  "--color-fg-secondary":  "#E2E8F0",
  "--color-fg-muted":      "#94A3B8",
  "--color-fg-subtle":     "#64748B",
  "--color-primary":       "#3B82F6",
  "--color-primary-muted": "rgba(59, 130, 246, 0.14)",
  "--color-active":        "#60A5FA",
  "--color-active-muted":  "rgba(96, 165, 250, 0.14)",
  "--color-accent-warm":   "#FB923C",
  "--color-mint-400":      "#60A5FA",
  "--color-mint-500":      "#3B82F6",
  "--color-mint-600":      "#2563EB",
  "--color-mint-700":      "#1D4ED8",
  "--radius-app":          "1.5rem",
  "--radius-card":         "1.75rem",
  "--shadow-card":         "0 1px 0 rgba(255,255,255,0.06) inset, 0 10px 32px rgba(0, 0, 0, 0.38)",
  "--shadow-card-hover":   "0 1px 0 rgba(255,255,255,0.08) inset, 0 16px 44px rgba(0, 0, 0, 0.48)",
  "--shadow-fab":          "0 10px 32px rgba(59, 130, 246, 0.48), 0 2px 0 rgba(255,255,255,0.12) inset",
  "--display-size":        "2.25rem",
  "--gradient-hero":       "linear-gradient(155deg, #1E3A8A 0%, #2563EB 45%, #0284C7 100%)",
  "--gradient-fab":          "linear-gradient(135deg, #3B82F6 0%, #2563EB 55%, #1D4ED8 100%)",
  "--nav-bar-height":      "3.25rem",
};

/** FinDash — premium fintech: white surfaces, purple FAB, dark nav bar. */
const FINDASH_LIGHT: ThemeTokenMap = {
  ...BANKING_LIGHT,
  "--color-cream":         "#FAFAFA",
  "--color-primary":       "#7C3AED",
  "--color-primary-muted": "rgba(124, 58, 237, 0.10)",
  "--color-active":        "#7C3AED",
  "--color-active-muted":  "rgba(124, 58, 237, 0.10)",
  "--color-accent-warm":   "#F97316",
  "--color-mint-400":      "#A78BFA",
  "--color-mint-500":      "#7C3AED",
  "--color-mint-600":      "#6D28D9",
  "--color-mint-700":      "#5B21B6",
  "--radius-app":          "1.25rem",
  "--radius-card":         "1.5rem",
  "--shadow-fab":          "0 12px 36px rgba(124, 58, 237, 0.42), 0 2px 0 rgba(255,255,255,0.2) inset",
  "--gradient-hero":       "linear-gradient(145deg, #7C3AED 0%, #9333EA 42%, #F97316 100%)",
  "--gradient-fab":        "linear-gradient(135deg, #9333EA 0%, #7C3AED 55%, #6D28D9 100%)",
};

const FINDASH_DARK: ThemeTokenMap = {
  ...BANKING_DARK,
  "--color-cream":         "#0A0A0F",
  "--color-surface":       "#111118",
  "--color-primary":       "#A78BFA",
  "--color-primary-muted": "rgba(167, 139, 250, 0.14)",
  "--color-active":        "#C4B5FD",
  "--color-active-muted":  "rgba(196, 181, 253, 0.14)",
  "--color-accent-warm":   "#FB923C",
  "--color-mint-400":      "#C4B5FD",
  "--color-mint-500":      "#A78BFA",
  "--color-mint-600":      "#9333EA",
  "--color-mint-700":      "#7C3AED",
  "--shadow-fab":          "0 12px 36px rgba(124, 58, 237, 0.55)",
  "--gradient-hero":       "linear-gradient(145deg, #4C1D95 0%, #7C3AED 45%, #EA580C 100%)",
  "--gradient-fab":        "linear-gradient(135deg, #A78BFA 0%, #7C3AED 55%, #5B21B6 100%)",
};

export const TEMPLATE_TOKEN_KEYS = [
  ...new Set([
    ...Object.keys(DEFAULT_DARK),
    ...Object.keys(BANKING_DARK),
    ...Object.keys(FINDASH_DARK),
  ]),
];

const TOKEN_TABLE: Record<ThemeTemplateId, Record<ThemeColorMode, ThemeTokenMap>> = {
  default: {
    light: DEFAULT_LIGHT,
    dark:  DEFAULT_DARK,
  },
  "modern-banking": {
    light: BANKING_LIGHT,
    dark:  BANKING_DARK,
  },
  findash: {
    light: FINDASH_LIGHT,
    dark:  FINDASH_DARK,
  },
};

export function getTemplateTokens(template: ThemeTemplateId, dark: boolean): ThemeTokenMap {
  return TOKEN_TABLE[template][dark ? "dark" : "light"];
}

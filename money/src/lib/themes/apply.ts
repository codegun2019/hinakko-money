import type { ThemeMode } from "~/lib/settings";
import { mergeAccentTokens, normalizeAccentId, type AccentColorId } from "./accents";
import { getTemplateThemeColor, type ThemeTemplateId } from "./index";
import { getTemplateTokens, TEMPLATE_TOKEN_KEYS } from "./tokens";

const VALID_TEMPLATES = new Set<ThemeTemplateId>(["default", "modern-banking", "findash"]);
const TEMPLATE_CLASSES = ["tpl-default", "tpl-modern-banking", "tpl-findash"] as const;

export function normalizeTemplateId(value: unknown): ThemeTemplateId {
  return typeof value === "string" && VALID_TEMPLATES.has(value as ThemeTemplateId)
    ? (value as ThemeTemplateId)
    : "modern-banking";
}

export function resolveDarkMode(theme: ThemeMode): boolean {
  if (theme === "dark") return true;
  if (theme === "light") return false;
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function tplClass(id: ThemeTemplateId): string {
  if (id === "modern-banking") return "tpl-modern-banking";
  if (id === "findash") return "tpl-findash";
  return "tpl-default";
}

/** Apply template + accent tokens directly on <html> — do NOT bind these attrs from React JSX. */
export function applyDocumentTheme(
  template: ThemeTemplateId,
  dark: boolean,
  accent: AccentColorId = "blue",
) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const safe = normalizeTemplateId(template);
  const safeAccent = normalizeAccentId(accent);
  const mode = dark ? "dark" : "light";
  const base = getTemplateTokens(safe, dark);
  const tokens = mergeAccentTokens(base, safeAccent, dark);

  root.dataset.template = safe;
  root.dataset.themeMode = mode;
  root.dataset.accent = safeAccent;
  root.classList.toggle("dark", dark);

  for (const cls of TEMPLATE_CLASSES) {
    root.classList.remove(cls);
  }
  root.classList.add(tplClass(safe));

  for (const key of TEMPLATE_TOKEN_KEYS) {
    root.style.removeProperty(key);
  }
  for (const [key, value] of Object.entries(tokens)) {
    root.style.setProperty(key, value);
  }

  root.style.setProperty("--app-shell-bg", dark ? tokens["--color-cream"] ?? "#0F1115" : "#EBEEF2");

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", getTemplateThemeColor(safe, dark));
  }
}

export function applyDocumentThemeFromSettings(
  theme: ThemeMode,
  template: unknown,
  accent?: unknown,
) {
  applyDocumentTheme(
    normalizeTemplateId(template),
    resolveDarkMode(theme),
    normalizeAccentId(accent),
  );
}

/** Read persisted settings from localStorage (bootstrap + hydration). */
export function readPersistedSettings(): {
  theme: ThemeMode;
  template: ThemeTemplateId;
  accentColor: AccentColorId;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("hinakko-settings");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: Record<string, unknown> };
    const state = (parsed.state ?? parsed) as Record<string, unknown>;
    const themeRaw = state.theme;
    const theme: ThemeMode =
      themeRaw === "light" || themeRaw === "dark" || themeRaw === "system" ? themeRaw : "light";
    return {
      theme,
      template: normalizeTemplateId(state.template),
      accentColor: normalizeAccentId(state.accentColor),
    };
  } catch {
    return null;
  }
}

export function bootstrapDocumentTheme() {
  const saved = readPersistedSettings();
  if (!saved) {
    applyDocumentTheme("modern-banking", false, "blue");
    return;
  }
  applyDocumentTheme(saved.template, resolveDarkMode(saved.theme), saved.accentColor);
}

export { normalizeAccentId } from "./accents";
export type { AccentColorId } from "./accents";

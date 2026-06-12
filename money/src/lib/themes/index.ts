export type ThemeTemplateId = "default" | "modern-banking" | "findash";

export interface ThemeTemplateMeta {
  id: ThemeTemplateId;
  labelKey: string;
  descKey: string;
  preview: {
    bg: string;
    surface: string;
    primary: string;
  };
  /** Browser chrome / PWA theme-color */
  themeColor: {
    light: string;
    dark: string;
  };
}

export const THEME_TEMPLATES: ThemeTemplateMeta[] = [
  {
    id:          "default",
    labelKey:    "settings.templateDefault",
    descKey:     "settings.templateDefaultDesc",
    preview:     { bg: "#EBEEF2", surface: "#FFFFFF", primary: "#4F8CFF" },
    themeColor:  { light: "#EBEEF2", dark: "#0F1115" },
  },
  {
    id:          "modern-banking",
    labelKey:    "settings.templateModernBanking",
    descKey:     "settings.templateModernBankingDesc",
    preview:     { bg: "#EBEEF2", surface: "#FFFFFF", primary: "#3B82F6" },
    themeColor:  { light: "#EBEEF2", dark: "#06080D" },
  },
  {
    id:          "findash",
    labelKey:    "settings.templateFinDash",
    descKey:     "settings.templateFinDashDesc",
    preview:     { bg: "#EBEEF2", surface: "#FFFFFF", primary: "#7C3AED" },
    themeColor:  { light: "#EBEEF2", dark: "#0A0A0F" },
  },
];

export const TEMPLATE_OPTIONS = THEME_TEMPLATES.map(({ id, labelKey, descKey }) => ({
  value: id,
  labelKey,
  descKey,
}));

export function getTemplateMeta(id: ThemeTemplateId): ThemeTemplateMeta {
  return THEME_TEMPLATES.find((t) => t.id === id) ?? THEME_TEMPLATES[0]!;
}

export function getTemplateThemeColor(id: ThemeTemplateId, dark: boolean): string {
  const meta = getTemplateMeta(id);
  return dark ? meta.themeColor.dark : meta.themeColor.light;
}

import { bootstrapDocumentTheme } from "~/lib/themes/apply";

export { applyDocumentTheme, applyDocumentThemeFromSettings, bootstrapDocumentTheme, normalizeTemplateId, readPersistedSettings, resolveDarkMode } from "./apply";
export { getTemplateTokens } from "./tokens";
export { ACCENT_PRESETS, DEFAULT_ACCENT, getAccentPreset, normalizeAccentId } from "./accents";
export type { AccentColorId } from "./accents";
export { initThemeRuntime } from "./init";
export { useThemeTemplate } from "./useTemplate";

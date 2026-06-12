import type { ThemeTokenMap } from "./tokens";

export type AccentColorId =
  | "blue" | "indigo" | "violet" | "purple" | "fuchsia" | "pink"
  | "rose" | "red" | "coral" | "orange" | "amber" | "yellow"
  | "lime" | "green" | "emerald" | "teal" | "cyan" | "sky";

export const DEFAULT_ACCENT: AccentColorId = "blue";

export interface AccentPreset {
  id:       AccentColorId;
  labelKey: string;
  swatch:   string;
  light:    ThemeTokenMap;
  dark:     ThemeTokenMap;
}

interface AccentPalette {
  swatch: string;
  light: {
    primary: string;
    m4: string; m5: string; m6: string; m7: string;
    hero: [string, string, string];
    fab:  [string, string, string];
  };
  dark: {
    primary: string;
    active: string;
    m4: string; m5: string; m6: string; m7: string;
    hero: [string, string, string];
    fab:  [string, string, string];
  };
}

function rgbaFromHex(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function grad155(stops: [string, string, string]): string {
  return `linear-gradient(155deg, ${stops[0]} 0%, ${stops[1]} 48%, ${stops[2]} 100%)`;
}

function grad135(stops: [string, string, string]): string {
  return `linear-gradient(135deg, ${stops[0]} 0%, ${stops[1]} 55%, ${stops[2]} 100%)`;
}

function buildPreset(id: AccentColorId, labelKey: string, p: AccentPalette): AccentPreset {
  const { swatch, light: L, dark: D } = p;
  const lightMuted = rgbaFromHex(L.primary, 0.10);
  const darkMuted  = rgbaFromHex(D.primary, 0.14);
  const darkActiveMuted = rgbaFromHex(D.active, 0.14);

  return {
    id,
    labelKey,
    swatch,
    light: {
      "--color-primary": L.primary,
      "--color-active": L.primary,
      "--color-primary-muted": lightMuted,
      "--color-active-muted": lightMuted,
      "--color-mint-400": L.m4,
      "--color-mint-500": L.m5,
      "--color-mint-600": L.m6,
      "--color-mint-700": L.m7,
      "--gradient-hero": grad155(L.hero),
      "--gradient-fab":  grad135(L.fab),
      "--shadow-fab": `0 8px 28px ${rgbaFromHex(L.primary, 0.35)}`,
    },
    dark: {
      "--color-primary": D.primary,
      "--color-active": D.active,
      "--color-primary-muted": darkMuted,
      "--color-active-muted": darkActiveMuted,
      "--color-mint-400": D.m4,
      "--color-mint-500": D.m5,
      "--color-mint-600": D.m6,
      "--color-mint-700": D.m7,
      "--gradient-hero": grad155(D.hero),
      "--gradient-fab":  grad135(D.fab),
      "--shadow-fab": `0 8px 28px ${rgbaFromHex(D.primary, 0.45)}`,
    },
  };
}

/** App accent presets — override primary / gradient tokens on top of any template. */
export const ACCENT_PRESETS: AccentPreset[] = [
  buildPreset("blue", "settings.accentBlue", {
    swatch: "#2563EB",
    light: { primary: "#2563EB", m4: "#3B82F6", m5: "#2563EB", m6: "#1D4ED8", m7: "#1E40AF", hero: ["#1D4ED8", "#2563EB", "#0284C7"], fab: ["#3B82F6", "#2563EB", "#1D4ED8"] },
    dark:  { primary: "#3B82F6", active: "#60A5FA", m4: "#60A5FA", m5: "#3B82F6", m6: "#2563EB", m7: "#1D4ED8", hero: ["#1E3A8A", "#2563EB", "#0284C7"], fab: ["#3B82F6", "#2563EB", "#1D4ED8"] },
  }),
  buildPreset("indigo", "settings.accentIndigo", {
    swatch: "#4F46E5",
    light: { primary: "#4F46E5", m4: "#6366F1", m5: "#4F46E5", m6: "#4338CA", m7: "#3730A3", hero: ["#3730A3", "#4F46E5", "#6366F1"], fab: ["#6366F1", "#4F46E5", "#4338CA"] },
    dark:  { primary: "#818CF8", active: "#A5B4FC", m4: "#A5B4FC", m5: "#818CF8", m6: "#6366F1", m7: "#4F46E5", hero: ["#312E81", "#4F46E5", "#6366F1"], fab: ["#818CF8", "#6366F1", "#4338CA"] },
  }),
  buildPreset("violet", "settings.accentViolet", {
    swatch: "#7C3AED",
    light: { primary: "#7C3AED", m4: "#8B5CF6", m5: "#7C3AED", m6: "#6D28D9", m7: "#5B21B6", hero: ["#5B21B6", "#7C3AED", "#9333EA"], fab: ["#8B5CF6", "#7C3AED", "#6D28D9"] },
    dark:  { primary: "#A78BFA", active: "#C4B5FD", m4: "#C4B5FD", m5: "#A78BFA", m6: "#8B5CF6", m7: "#7C3AED", hero: ["#4C1D95", "#7C3AED", "#9333EA"], fab: ["#A78BFA", "#8B5CF6", "#6D28D9"] },
  }),
  buildPreset("purple", "settings.accentPurple", {
    swatch: "#9333EA",
    light: { primary: "#9333EA", m4: "#A855F7", m5: "#9333EA", m6: "#7E22CE", m7: "#6B21A8", hero: ["#6B21A8", "#9333EA", "#A855F7"], fab: ["#A855F7", "#9333EA", "#7E22CE"] },
    dark:  { primary: "#C084FC", active: "#D8B4FE", m4: "#D8B4FE", m5: "#C084FC", m6: "#A855F7", m7: "#9333EA", hero: ["#581C87", "#9333EA", "#A855F7"], fab: ["#C084FC", "#A855F7", "#7E22CE"] },
  }),
  buildPreset("fuchsia", "settings.accentFuchsia", {
    swatch: "#C026D3",
    light: { primary: "#C026D3", m4: "#D946EF", m5: "#C026D3", m6: "#A21CAF", m7: "#86198F", hero: ["#86198F", "#C026D3", "#D946EF"], fab: ["#D946EF", "#C026D3", "#A21CAF"] },
    dark:  { primary: "#E879F9", active: "#F0ABFC", m4: "#F0ABFC", m5: "#E879F9", m6: "#D946EF", m7: "#C026D3", hero: ["#701A75", "#C026D3", "#D946EF"], fab: ["#E879F9", "#D946EF", "#A21CAF"] },
  }),
  buildPreset("pink", "settings.accentPink", {
    swatch: "#DB2777",
    light: { primary: "#DB2777", m4: "#EC4899", m5: "#DB2777", m6: "#BE185D", m7: "#9D174D", hero: ["#9D174D", "#DB2777", "#EC4899"], fab: ["#EC4899", "#DB2777", "#BE185D"] },
    dark:  { primary: "#F472B6", active: "#F9A8D4", m4: "#F9A8D4", m5: "#F472B6", m6: "#EC4899", m7: "#DB2777", hero: ["#831843", "#DB2777", "#EC4899"], fab: ["#F472B6", "#EC4899", "#BE185D"] },
  }),
  buildPreset("rose", "settings.accentRose", {
    swatch: "#E11D48",
    light: { primary: "#E11D48", m4: "#FB7185", m5: "#E11D48", m6: "#BE123C", m7: "#9F1239", hero: ["#9F1239", "#E11D48", "#F43F5E"], fab: ["#FB7185", "#E11D48", "#BE123C"] },
    dark:  { primary: "#FB7185", active: "#FDA4AF", m4: "#FDA4AF", m5: "#FB7185", m6: "#F43F5E", m7: "#E11D48", hero: ["#881337", "#E11D48", "#F43F5E"], fab: ["#FB7185", "#F43F5E", "#BE123C"] },
  }),
  buildPreset("red", "settings.accentRed", {
    swatch: "#DC2626",
    light: { primary: "#DC2626", m4: "#EF4444", m5: "#DC2626", m6: "#B91C1C", m7: "#991B1B", hero: ["#991B1B", "#DC2626", "#EF4444"], fab: ["#EF4444", "#DC2626", "#B91C1C"] },
    dark:  { primary: "#F87171", active: "#FCA5A5", m4: "#FCA5A5", m5: "#F87171", m6: "#EF4444", m7: "#DC2626", hero: ["#7F1D1D", "#DC2626", "#EF4444"], fab: ["#F87171", "#EF4444", "#B91C1C"] },
  }),
  buildPreset("coral", "settings.accentCoral", {
    swatch: "#F97316",
    light: { primary: "#F97316", m4: "#FB923C", m5: "#F97316", m6: "#EA580C", m7: "#C2410C", hero: ["#C2410C", "#F97316", "#FB923C"], fab: ["#FB923C", "#F97316", "#EA580C"] },
    dark:  { primary: "#FB923C", active: "#FDBA74", m4: "#FDBA74", m5: "#FB923C", m6: "#F97316", m7: "#EA580C", hero: ["#9A3412", "#F97316", "#FB923C"], fab: ["#FB923C", "#F97316", "#EA580C"] },
  }),
  buildPreset("orange", "settings.accentOrange", {
    swatch: "#EA580C",
    light: { primary: "#EA580C", m4: "#FB923C", m5: "#EA580C", m6: "#C2410C", m7: "#9A3412", hero: ["#9A3412", "#EA580C", "#F97316"], fab: ["#FB923C", "#EA580C", "#C2410C"] },
    dark:  { primary: "#FB923C", active: "#FDBA74", m4: "#FDBA74", m5: "#FB923C", m6: "#EA580C", m7: "#C2410C", hero: ["#7C2D12", "#EA580C", "#F97316"], fab: ["#FB923C", "#EA580C", "#C2410C"] },
  }),
  buildPreset("amber", "settings.accentAmber", {
    swatch: "#D97706",
    light: { primary: "#D97706", m4: "#F59E0B", m5: "#D97706", m6: "#B45309", m7: "#92400E", hero: ["#92400E", "#D97706", "#F59E0B"], fab: ["#F59E0B", "#D97706", "#B45309"] },
    dark:  { primary: "#FBBF24", active: "#FCD34D", m4: "#FCD34D", m5: "#FBBF24", m6: "#F59E0B", m7: "#D97706", hero: ["#78350F", "#D97706", "#F59E0B"], fab: ["#FBBF24", "#F59E0B", "#B45309"] },
  }),
  buildPreset("yellow", "settings.accentYellow", {
    swatch: "#CA8A04",
    light: { primary: "#CA8A04", m4: "#EAB308", m5: "#CA8A04", m6: "#A16207", m7: "#854D0E", hero: ["#854D0E", "#CA8A04", "#EAB308"], fab: ["#EAB308", "#CA8A04", "#A16207"] },
    dark:  { primary: "#FACC15", active: "#FDE047", m4: "#FDE047", m5: "#FACC15", m6: "#EAB308", m7: "#CA8A04", hero: ["#713F12", "#CA8A04", "#EAB308"], fab: ["#FACC15", "#EAB308", "#A16207"] },
  }),
  buildPreset("lime", "settings.accentLime", {
    swatch: "#65A30D",
    light: { primary: "#65A30D", m4: "#84CC16", m5: "#65A30D", m6: "#4D7C0F", m7: "#3F6212", hero: ["#3F6212", "#65A30D", "#84CC16"], fab: ["#84CC16", "#65A30D", "#4D7C0F"] },
    dark:  { primary: "#A3E635", active: "#BEF264", m4: "#BEF264", m5: "#A3E635", m6: "#84CC16", m7: "#65A30D", hero: ["#365314", "#65A30D", "#84CC16"], fab: ["#A3E635", "#84CC16", "#4D7C0F"] },
  }),
  buildPreset("green", "settings.accentGreen", {
    swatch: "#059669",
    light: { primary: "#059669", m4: "#34D399", m5: "#059669", m6: "#047857", m7: "#065F46", hero: ["#065F46", "#059669", "#10B981"], fab: ["#10B981", "#059669", "#047857"] },
    dark:  { primary: "#34D399", active: "#6EE7B7", m4: "#6EE7B7", m5: "#34D399", m6: "#10B981", m7: "#059669", hero: ["#064E3B", "#059669", "#10B981"], fab: ["#10B981", "#059669", "#047857"] },
  }),
  buildPreset("emerald", "settings.accentEmerald", {
    swatch: "#10B981",
    light: { primary: "#10B981", m4: "#34D399", m5: "#10B981", m6: "#059669", m7: "#047857", hero: ["#047857", "#10B981", "#34D399"], fab: ["#34D399", "#10B981", "#059669"] },
    dark:  { primary: "#34D399", active: "#6EE7B7", m4: "#6EE7B7", m5: "#34D399", m6: "#10B981", m7: "#059669", hero: ["#064E3B", "#10B981", "#34D399"], fab: ["#34D399", "#10B981", "#059669"] },
  }),
  buildPreset("teal", "settings.accentTeal", {
    swatch: "#0D9488",
    light: { primary: "#0D9488", m4: "#2DD4BF", m5: "#0D9488", m6: "#0F766E", m7: "#115E59", hero: ["#115E59", "#0D9488", "#14B8A6"], fab: ["#14B8A6", "#0D9488", "#0F766E"] },
    dark:  { primary: "#2DD4BF", active: "#5EEAD4", m4: "#5EEAD4", m5: "#2DD4BF", m6: "#14B8A6", m7: "#0D9488", hero: ["#134E4A", "#0D9488", "#14B8A6"], fab: ["#14B8A6", "#0D9488", "#0F766E"] },
  }),
  buildPreset("cyan", "settings.accentCyan", {
    swatch: "#0891B2",
    light: { primary: "#0891B2", m4: "#22D3EE", m5: "#0891B2", m6: "#0E7490", m7: "#155E75", hero: ["#155E75", "#0891B2", "#06B6D4"], fab: ["#22D3EE", "#0891B2", "#0E7490"] },
    dark:  { primary: "#22D3EE", active: "#67E8F9", m4: "#67E8F9", m5: "#22D3EE", m6: "#06B6D4", m7: "#0891B2", hero: ["#164E63", "#0891B2", "#06B6D4"], fab: ["#22D3EE", "#06B6D4", "#0E7490"] },
  }),
  buildPreset("sky", "settings.accentSky", {
    swatch: "#0284C7",
    light: { primary: "#0284C7", m4: "#38BDF8", m5: "#0284C7", m6: "#0369A1", m7: "#075985", hero: ["#075985", "#0284C7", "#0EA5E9"], fab: ["#38BDF8", "#0284C7", "#0369A1"] },
    dark:  { primary: "#38BDF8", active: "#7DD3FC", m4: "#7DD3FC", m5: "#38BDF8", m6: "#0EA5E9", m7: "#0284C7", hero: ["#0C4A6E", "#0284C7", "#0EA5E9"], fab: ["#38BDF8", "#0EA5E9", "#0369A1"] },
  }),
];

const VALID = new Set(ACCENT_PRESETS.map((p) => p.id));

export function normalizeAccentId(value: unknown): AccentColorId {
  return typeof value === "string" && VALID.has(value as AccentColorId)
    ? (value as AccentColorId)
    : DEFAULT_ACCENT;
}

export function getAccentPreset(id: AccentColorId): AccentPreset {
  return ACCENT_PRESETS.find((p) => p.id === id) ?? ACCENT_PRESETS[0]!;
}

export function mergeAccentTokens(base: ThemeTokenMap, accentId: AccentColorId, dark: boolean): ThemeTokenMap {
  const preset = getAccentPreset(accentId);
  const overlay = dark ? preset.dark : preset.light;
  return { ...base, ...overlay };
}

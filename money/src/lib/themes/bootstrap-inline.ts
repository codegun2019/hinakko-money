import type { ThemeTemplateId } from "./index";
import { ACCENT_PRESETS, type AccentColorId } from "./accents";
import { mergeAccentTokens } from "./accents";
import { getTemplateTokens } from "./tokens";

function embedMerged(template: ThemeTemplateId, dark: boolean, accent: AccentColorId): string {
  const base = getTemplateTokens(template, dark);
  return JSON.stringify(mergeAccentTokens(base, accent, dark));
}

function buildAccentMapJs(): string {
  const templates: ThemeTemplateId[] = ["default", "modern-banking", "findash"];
  const parts: string[] = [];

  for (const preset of ACCENT_PRESETS) {
    const tplParts: string[] = [];
    for (const tpl of templates) {
      tplParts.push(
        `"${tpl}": { dark: ${embedMerged(tpl, true, preset.id)}, light: ${embedMerged(tpl, false, preset.id)} }`,
      );
    }
    parts.push(`"${preset.id}": { ${tplParts.join(", ")} }`);
  }

  return `{ ${parts.join(", ")} }`;
}

const ACCENT_MAP_JS = buildAccentMapJs();
const ACCENT_IDS_JS = JSON.stringify(ACCENT_PRESETS.map((p) => p.id));

/** Self-contained bootstrap script (inlined in <head> before CSS paint). */
export const THEME_BOOTSTRAP_INLINE = `
(function(){
  try {
    var ACCENTS = ${ACCENT_IDS_JS};
    var accentMap = ${ACCENT_MAP_JS};
    var t = "modern-banking";
    var m = "light";
    var accent = "blue";
    var raw = localStorage.getItem("hinakko-settings");
    if (raw) {
      var p = JSON.parse(raw);
      var s = p.state || p;
      t = s.template === "default" ? "default" : s.template === "findash" ? "findash" : "modern-banking";
      m = s.theme === "dark" || s.theme === "light" || s.theme === "system" ? s.theme : "light";
      accent = ACCENTS.indexOf(s.accentColor) >= 0 ? s.accentColor : "blue";
    }
    var dark = m === "dark" || (m !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    var root = document.documentElement;
    root.dataset.template = t;
    root.dataset.accent = accent;
    root.dataset.themeMode = dark ? "dark" : "light";
    root.classList.toggle("dark", dark);
    root.classList.remove("tpl-default","tpl-modern-banking","tpl-findash");
    root.classList.add(t === "findash" ? "tpl-findash" : t === "modern-banking" ? "tpl-modern-banking" : "tpl-default");
    var byAccent = accentMap[accent] || accentMap.blue;
    var byTpl = byAccent[t] || byAccent["modern-banking"];
    var tokens = byTpl[dark ? "dark" : "light"];
    for (var k in tokens) { if (Object.prototype.hasOwnProperty.call(tokens, k)) root.style.setProperty(k, tokens[k]); }
  } catch (e) {}
})();
`.trim();

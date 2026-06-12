import { useSettingsStore } from "~/lib/store";
import type { ThemeTemplateId } from "./index";

export function useThemeTemplate() {
  const template = useSettingsStore((s) => s.template);
  return {
    template,
    isModernBanking: template === "modern-banking",
    isFinDash:       template === "findash",
    isGlassHero:     template === "modern-banking" || template === "findash",
    isDefault:       template === "default",
  } satisfies { template: ThemeTemplateId; isModernBanking: boolean; isFinDash: boolean; isGlassHero: boolean; isDefault: boolean };
}

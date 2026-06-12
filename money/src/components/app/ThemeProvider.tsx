import { useEffect, type ReactNode } from "react";
import { useSettingsStore } from "~/lib/store";
import { initThemeRuntime } from "~/lib/themes/init";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const language = useSettingsStore((s) => s.language);

  useEffect(() => {
    initThemeRuntime();
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === "th" ? "th" : "en";
  }, [language]);

  return children;
}

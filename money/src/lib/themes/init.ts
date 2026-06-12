import { useSettingsStore } from "~/lib/store";
import { applyDocumentTheme, resolveDarkMode } from "./apply";

let started = false;
let systemMq: MediaQueryList | null = null;
let systemHandler: (() => void) | null = null;

function syncDocumentTheme() {
  const { theme, template, accentColor } = useSettingsStore.getState();
  applyDocumentTheme(template, resolveDarkMode(theme), accentColor);
}

function attachSystemThemeListener() {
  if (typeof window === "undefined") return;

  if (systemMq && systemHandler) {
    systemMq.removeEventListener("change", systemHandler);
    systemMq = null;
    systemHandler = null;
  }

  const { theme, template } = useSettingsStore.getState();
  if (theme !== "system") return;

  systemMq = window.matchMedia("(prefers-color-scheme: dark)");
  systemHandler = () => {
    const { template: tpl, accentColor } = useSettingsStore.getState();
    applyDocumentTheme(tpl, systemMq!.matches, accentColor);
  };
  systemMq.addEventListener("change", systemHandler);
}

/** Subscribe to settings store and keep <html> tokens in sync (client-only). */
export function initThemeRuntime() {
  if (started || typeof window === "undefined") return;
  started = true;

  useSettingsStore.persist.onFinishHydration(() => {
    syncDocumentTheme();
    attachSystemThemeListener();
  });

  useSettingsStore.subscribe((state, prev) => {
    if (
      state.template !== prev.template ||
      state.theme !== prev.theme ||
      state.accentColor !== prev.accentColor
    ) {
      syncDocumentTheme();
      attachSystemThemeListener();
    }
  });

  syncDocumentTheme();
  attachSystemThemeListener();
}

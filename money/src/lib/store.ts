import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AddFlowMode, CurrencyCode, LanguageCode, ThemeMode } from "~/lib/settings";
import type { ThemeTemplateId } from "~/lib/themes";
import type { AccentColorId } from "~/lib/themes/accents";
import { normalizeAccentId } from "~/lib/themes/accents";
import { applyDocumentTheme, normalizeTemplateId, resolveDarkMode } from "~/lib/themes/apply";
import type { PaymentMethod, TransactionType } from "~/lib/types";

export interface LastQuickAddPrefs {
  type:          TransactionType;
  categoryId:    string;
  paymentMethod: PaymentMethod;
  amount?:       string;
}

interface SettingsStore {
  theme:       ThemeMode;
  template:    ThemeTemplateId;
  accentColor: AccentColorId;
  currency:    CurrencyCode;
  language:    LanguageCode;
  onboardingDone: boolean;
  /** v0.3 quick sheet (default) | v0.2 full-page form */
  addFlow:     AddFlowMode;
  lastQuickAdd: LastQuickAddPrefs | null;
  transactionSaveCount: number;
  installPromptDismissed: boolean;
  setTheme:      (theme: ThemeMode) => void;
  setTemplate:   (template: ThemeTemplateId) => void;
  setAccentColor:(accent: AccentColorId) => void;
  setCurrency:   (currency: CurrencyCode) => void;
  setLanguage:   (language: LanguageCode) => void;
  setOnboardingDone: (done: boolean) => void;
  setAddFlow:    (mode: AddFlowMode) => void;
  setLastQuickAdd: (prefs: LastQuickAddPrefs) => void;
  incrementSaveCount: () => void;
  dismissInstallPrompt: () => void;
}

function syncTheme(get: () => SettingsStore) {
  const { template, theme, accentColor } = get();
  applyDocumentTheme(normalizeTemplateId(template), resolveDarkMode(theme), normalizeAccentId(accentColor));
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      theme:       "light",
      template:    "modern-banking",
      accentColor: "blue",
      currency:    "THB",
      language:    "th",
      onboardingDone: false,
      addFlow:     "quick",
      lastQuickAdd: null,
      transactionSaveCount: 0,
      installPromptDismissed: false,
      setTheme: (theme) => {
        set({ theme });
        syncTheme(get);
      },
      setTemplate: (template) => {
        set({ template: normalizeTemplateId(template) });
        syncTheme(get);
      },
      setAccentColor: (accentColor) => {
        set({ accentColor: normalizeAccentId(accentColor) });
        syncTheme(get);
      },
      setCurrency: (currency) => set({ currency }),
      setLanguage: (language) => set({ language }),
      setOnboardingDone: (onboardingDone) => set({ onboardingDone }),
      setAddFlow: (addFlow) => set({ addFlow }),
      setLastQuickAdd: (lastQuickAdd) => set({ lastQuickAdd }),
      incrementSaveCount: () => set((s) => ({ transactionSaveCount: s.transactionSaveCount + 1 })),
      dismissInstallPrompt: () => set({ installPromptDismissed: true }),
    }),
    {
      name: "hinakko-settings",
      version: 6,
      partialize: (s) => ({
        theme:       s.theme,
        template:    s.template,
        accentColor: s.accentColor,
        currency:    s.currency,
        language:    s.language,
        onboardingDone: s.onboardingDone,
        addFlow:     s.addFlow,
        lastQuickAdd: s.lastQuickAdd,
        transactionSaveCount: s.transactionSaveCount,
        installPromptDismissed: s.installPromptDismissed,
      }),
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<SettingsStore>;
        return {
          ...current,
          ...saved,
          template:    normalizeTemplateId(saved.template ?? current.template),
          accentColor: normalizeAccentId(saved.accentColor ?? current.accentColor),
          onboardingDone: saved.onboardingDone ?? current.onboardingDone,
          addFlow:     saved.addFlow ?? current.addFlow,
          lastQuickAdd: saved.lastQuickAdd ?? current.lastQuickAdd,
          transactionSaveCount: saved.transactionSaveCount ?? current.transactionSaveCount,
          installPromptDismissed: saved.installPromptDismissed ?? current.installPromptDismissed,
        };
      },
    }
  )
);

/** @deprecated use useSettingsStore */
export const useAppStore = useSettingsStore;

import { useCallback } from "react";
import { enUS, th as thLocale } from "date-fns/locale";
import type { Locale } from "date-fns";
import type { AddFlowMode, CurrencyCode, LanguageCode, ThemeMode } from "~/lib/settings";
import type { AccentColorId, ThemeTemplateId } from "~/lib/themes";
import { ACCENT_PRESETS, TEMPLATE_OPTIONS } from "~/lib/themes";
import {
  ADD_FLOW_OPTIONS,
  CURRENCY_OPTIONS,
  LANGUAGE_OPTIONS,
  THEME_OPTIONS,
} from "~/lib/settings";
import { useSettingsStore } from "~/lib/store";
import { translations, type Messages } from "./translations";
import type { PaymentMethod } from "~/lib/types";

type NestedKeyOf<T, Prefix extends string = ""> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? NestedKeyOf<T[K], `${Prefix}${K}.`>
        : `${Prefix}${K}`;
    }[keyof T & string]
  : never;

export type TranslationKey = NestedKeyOf<Messages>;

function getNested(obj: unknown, path: string): string | undefined {
  let cur: unknown = obj;
  for (const part of path.split(".")) {
    if (!cur || typeof cur !== "object" || !(part in cur)) return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return typeof cur === "string" ? cur : undefined;
}

export function translate(
  lang: LanguageCode,
  key: TranslationKey,
  params?: Record<string, string | number>
): string {
  let text = getNested(translations[lang], key) ?? getNested(translations.en, key) ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replaceAll(`{${k}}`, String(v));
    }
  }
  return text;
}

export function getDateLocale(lang: LanguageCode): Locale {
  return lang === "th" ? thLocale : enUS;
}

export function getCategoryName(categoryId: string, lang: LanguageCode): string {
  const key = `category.${categoryId}` as TranslationKey;
  return translate(lang, key);
}

export function getCategoryShortName(categoryId: string, lang: LanguageCode): string {
  const key = `categoryShort.${categoryId}` as TranslationKey;
  return translate(lang, key);
}

export function getPaymentLabel(method: PaymentMethod, lang: LanguageCode, full = false): string {
  const key = (full ? `payment.${method === "installment" ? "installmentFull" : method}` : `payment.${method}`) as TranslationKey;
  return translate(lang, key);
}

export function getThemeLabel(mode: ThemeMode, lang: LanguageCode): string {
  const opt = THEME_OPTIONS.find((t) => t.value === mode);
  return translate(lang, (opt?.labelKey ?? "settings.themeLight") as TranslationKey);
}

export function getTemplateLabel(id: ThemeTemplateId, lang: LanguageCode): string {
  const opt = TEMPLATE_OPTIONS.find((t) => t.value === id);
  return translate(lang, (opt?.labelKey ?? "settings.templateDefault") as TranslationKey);
}

export function getLanguageLabel(code: LanguageCode): string {
  const opt = LANGUAGE_OPTIONS.find((l) => l.value === code);
  return translate(code, (opt?.labelKey ?? "settings.langTh") as TranslationKey);
}

export function getCurrencyLabel(code: CurrencyCode, lang: LanguageCode): string {
  const opt = CURRENCY_OPTIONS.find((c) => c.code === code);
  return translate(lang, (opt?.labelKey ?? "settings.currencyTHB") as TranslationKey);
}

export function getAccentLabel(id: AccentColorId, lang: LanguageCode): string {
  const preset = ACCENT_PRESETS.find((p) => p.id === id);
  return translate(lang, (preset?.labelKey ?? "settings.accentBlue") as TranslationKey);
}

export function getAddFlowLabel(mode: AddFlowMode, lang: LanguageCode): string {
  const opt = ADD_FLOW_OPTIONS.find((o) => o.value === mode);
  return translate(lang, (opt?.labelKey ?? "settings.addFlowQuick") as TranslationKey);
}

export function useTranslation() {
  const language = useSettingsStore((s) => s.language);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) =>
      translate(language, key, params),
    [language]
  );

  return {
    t,
    language,
    dateLocale: getDateLocale(language),
  };
}

export type ThemeMode = "light" | "dark" | "system";
export type CurrencyCode = "THB" | "USD" | "EUR";
export type LanguageCode = "th" | "en";
export type AddFlowMode = "quick" | "full";

export const ADD_FLOW_OPTIONS: { value: AddFlowMode; labelKey: string }[] = [
  { value: "quick", labelKey: "settings.addFlowQuick" },
  { value: "full",  labelKey: "settings.addFlowFull" },
];

export const THEME_OPTIONS: { value: ThemeMode; labelKey: string }[] = [
  { value: "light",  labelKey: "settings.themeLight" },
  { value: "dark",   labelKey: "settings.themeDark" },
  { value: "system", labelKey: "settings.themeSystem" },
];

export const CURRENCY_OPTIONS: {
  code: CurrencyCode;
  symbol: string;
  locale: string;
  labelKey: string;
}[] = [
  { code: "THB", symbol: "฿", locale: "th-TH", labelKey: "settings.currencyTHB" },
  { code: "USD", symbol: "$", locale: "en-US", labelKey: "settings.currencyUSD" },
  { code: "EUR", symbol: "€", locale: "de-DE", labelKey: "settings.currencyEUR" },
];

export const LANGUAGE_OPTIONS: { value: LanguageCode; labelKey: string }[] = [
  { value: "th", labelKey: "settings.langTh" },
  { value: "en", labelKey: "settings.langEn" },
];

const DEFAULT_CURRENCY = CURRENCY_OPTIONS[0]!;

export function getCurrencyConfig(code: CurrencyCode) {
  return CURRENCY_OPTIONS.find((c) => c.code === code) ?? DEFAULT_CURRENCY;
}

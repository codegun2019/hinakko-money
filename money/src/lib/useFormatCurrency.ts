import { useCallback } from "react";
import { formatCurrencyAmount } from "~/lib/format";
import { useSettingsStore } from "~/lib/store";

export function useFormatCurrency() {
  const currency = useSettingsStore((s) => s.currency);
  return useCallback(
    (amount: number) => formatCurrencyAmount(amount, currency),
    [currency]
  );
}

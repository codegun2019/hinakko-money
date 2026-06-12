import { cn } from "~/lib/format";
import { useFormatCurrency } from "~/lib/useFormatCurrency";
import type { TransactionType } from "~/lib/types";

interface Props {
  amount:      number;
  type:        TransactionType;
  size?:       "xs" | "sm" | "md" | "lg" | "xl";
  showSign?:   boolean;
  className?:  string;
}

const sizeMap = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg font-semibold",
  xl: "text-2xl font-bold",
} as const;

export function AmountText({ amount, type, size = "md", showSign = true, className }: Props) {
  const fmt = useFormatCurrency();
  const isIncome = type === "income";
  return (
    <span className={cn(sizeMap[size], isIncome ? "text-income" : "text-coral-400", className)}>
      {showSign && (isIncome ? "+" : "−")}
      {fmt(amount)}
    </span>
  );
}

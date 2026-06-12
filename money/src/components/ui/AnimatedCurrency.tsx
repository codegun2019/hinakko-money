import { cn } from "~/lib/format";
import { useAnimatedNumber } from "~/lib/useAnimatedNumber";
import { useFormatCurrency } from "~/lib/useFormatCurrency";

interface Props {
  value:     number;
  className?: string;
  /** Prefix before amount, e.g. "−" for negative balance */
  prefix?:   string;
  duration?: number;
}

export function AnimatedCurrency({ value, className, prefix = "", duration = 480 }: Props) {
  const animated = useAnimatedNumber(Math.abs(value), duration);
  const fmt = useFormatCurrency();
  const signPrefix = value < 0 && prefix === "" ? "−" : prefix;

  return (
    <span className={cn("tabular-nums", className)}>
      {signPrefix}
      {fmt(animated)}
    </span>
  );
}

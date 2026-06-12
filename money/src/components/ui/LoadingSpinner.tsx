import { cn } from "~/lib/format";

interface Props {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const sizeMap = { sm: "h-4 w-4 border-2", md: "h-6 w-6 border-2", lg: "h-8 w-8 border-[2.5px]" };

export function LoadingSpinner({ size = "md", className, label = "Loading" }: Props) {
  return (
    <div className={cn("flex flex-col items-center gap-3", className)} role="status" aria-label={label}>
      <div className={cn("animate-spin-slow rounded-full border-mint-500/20 border-t-mint-500", sizeMap[size])} />
      <span className="sr-only">{label}</span>
    </div>
  );
}

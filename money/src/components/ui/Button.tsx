import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "~/lib/format";
import { LoadingSpinner } from "~/components/ui/LoadingSpinner";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size    = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   Variant;
  size?:      Size;
  children:   ReactNode;
  fullWidth?: boolean;
  loading?:   boolean;
}

const variantMap: Record<Variant, string> = {
  primary:   "bg-mint-500 text-white shadow-sm shadow-mint-500/20 hover:bg-mint-600 active:bg-mint-700",
  secondary: "bg-coral-400 text-white shadow-sm shadow-coral-400/20 hover:bg-coral-500 active:bg-coral-600",
  ghost:     "bg-surface-muted text-fg hover:opacity-90 active:opacity-80 border border-app",
  danger:    "bg-coral-400/10 text-coral-400 border border-coral-400/20 hover:bg-coral-400/15",
};

const sizeMap: Record<Size, string> = {
  sm: "h-9  px-3.5 text-xs  rounded-lg",
  md: "h-10 px-4   text-sm  rounded-lg",
  lg: "h-[48px] px-5 text-[15px] rounded-xl font-semibold",
};

export function Button({ variant = "primary", size = "md", children, fullWidth, className, loading, disabled, ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-cream)]",
        variantMap[variant],
        sizeMap[size],
        fullWidth && "w-full",
        (disabled || loading) && "opacity-60 pointer-events-none",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" className="gap-0 [&>div]:border-white/30 [&>div]:border-t-white" />}
      {children}
    </button>
  );
}

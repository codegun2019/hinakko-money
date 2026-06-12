import type { LucideIcon } from "lucide-react";
import { cn } from "~/lib/format";
import { getCategoryIcon } from "~/lib/icons";

export type IconSize = "xs" | "sm" | "md" | "lg" | "xl";

const SIZE_MAP: Record<IconSize, number> = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

interface Props {
  icon: LucideIcon;
  size?: IconSize;
  className?: string;
  strokeWidth?: number;
  "aria-hidden"?: boolean;
  "aria-label"?: string;
}

export function AppIcon({
  icon: Icon,
  size = "md",
  className,
  strokeWidth = 2,
  "aria-hidden": ariaHidden = true,
  "aria-label": ariaLabel,
}: Props) {
  const px = SIZE_MAP[size];
  return (
    <Icon
      size={px}
      strokeWidth={strokeWidth}
      className={cn("shrink-0", className)}
      aria-hidden={ariaHidden && !ariaLabel ? true : undefined}
      aria-label={ariaLabel}
    />
  );
}

interface CategoryIconProps {
  categoryId: string;
  size?: IconSize;
  className?: string;
  color?: string;
}

export function CategoryIcon({ categoryId, size = "md", className, color }: CategoryIconProps) {
  const Icon = getCategoryIcon(categoryId);
  return (
    <Icon
      size={SIZE_MAP[size]}
      strokeWidth={2}
      className={cn("shrink-0", className)}
      style={color ? { color } : undefined}
      aria-hidden
    />
  );
}

import type { ReactNode } from "react";
import { cn } from "~/lib/format";

interface Props {
  children:  ReactNode;
  className?: string;
  onClick?:  () => void;
  padding?:  "none" | "sm" | "md" | "lg";
  elevated?: boolean;
}

const paddingMap = { none: "", sm: "p-3", md: "p-4", lg: "p-5" } as const;

export function Card({ children, className, onClick, padding = "md", elevated = false }: Props) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      className={cn(
        elevated ? "card-surface-elevated" : "card-surface",
        paddingMap[padding],
        onClick && "active:scale-[0.985] transition-transform duration-150 text-left",
        className
      )}
      onClick={onClick}
    >
      {children}
    </Tag>
  );
}

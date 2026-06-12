import type { ReactNode } from "react";
import { cn } from "~/lib/format";

interface Props {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
  bubble?: boolean;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  compact = false,
  bubble = true,
}: Props) {
  return (
    <div
      className={cn(
        "empty-state flex flex-col items-center justify-center px-6 text-center animate-fade-in",
        compact ? "py-6" : "px-8 py-16",
        bubble && "empty-state-bubble",
        className,
      )}
    >
      <div
        className={cn(
          "empty-state-icon glass-card relative flex items-center justify-center overflow-hidden",
          compact ? "mb-3 h-16 w-16" : "mb-5 h-20 w-20",
        )}
      >
        {bubble && (
          <>
            <span className="empty-bubble empty-bubble-a" aria-hidden />
            <span className="empty-bubble empty-bubble-b" aria-hidden />
          </>
        )}
        <span className="relative z-[1]">{icon ?? <DefaultIcon />}</span>
      </div>
      <h3 className="text-title text-fg mb-1.5">{title}</h3>
      {description && (
        <p className="text-caption text-fg-muted max-w-[260px] leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-6 w-full max-w-[240px]">{action}</div>}
    </div>
  );
}

function DefaultIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <line x1="9" y1="9" x2="15" y2="15" />
      <line x1="15" y1="9" x2="9" y2="15" />
    </svg>
  );
}

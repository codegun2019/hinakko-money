import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "~/lib/format";
import { getScrollContainer, setScrollContainer } from "~/lib/scroll-container";

interface Props {
  children: ReactNode;
  header?: ReactNode;
  /** Reserve space above bottom navigation (default true) */
  withNav?: boolean;
  /** Form layout — extra keyboard scroll padding */
  isForm?: boolean;
  className?: string;
  contentClassName?: string;
}

export function PageLayout({
  children,
  header,
  withNav = true,
  isForm = false,
  className,
  contentClassName,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    setScrollContainer(el);
    return () => {
      if (getScrollContainer() === el) setScrollContainer(null);
    };
  }, []);

  return (
    <div className={cn("flex flex-col h-full min-h-0 bg-app", className)}>
      {header}
      <div
        ref={scrollRef}
        data-scroll-container
        className={cn(
          "flex-1 min-h-0 overflow-y-auto overflow-x-hidden no-scrollbar",
          withNav ? "pb-nav" : isForm ? "pb-form" : "pb-safe",
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}

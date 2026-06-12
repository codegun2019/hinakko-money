import type { ReactNode } from "react";

interface Props {
  title:  string;
  right?: ReactNode;
  left?:  ReactNode;
}

export function MobileHeader({ title, right, left }: Props) {
  return (
    <header className="banking-page-header safe-top shrink-0 border-b border-app bg-surface">
      <div className="flex h-12 items-center justify-between px-4">
        <div className="w-14">{left ?? <span />}</div>
        <h1 className="max-w-[220px] truncate text-center text-title text-fg">{title}</h1>
        <div className="flex w-14 justify-end">{right ?? <span />}</div>
      </div>
    </header>
  );
}

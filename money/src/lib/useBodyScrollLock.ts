import { useEffect } from "react";

export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    document.body.classList.add("sheet-open");
    return () => document.body.classList.remove("sheet-open");
  }, [locked]);
}

import { create } from "zustand";
import { haptic } from "~/lib/haptics";

export type ToastKind = "success" | "error" | "info";

export interface ToastItem {
  id:      string;
  message: string;
  kind:    ToastKind;
}

interface ToastStore {
  toasts:  ToastItem[];
  push:    (message: string, kind?: ToastKind) => string;
  dismiss: (id: string) => void;
}

let toastCounter = 0;

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  push: (message, kind = "success") => {
    const id = String(++toastCounter);
    set({ toasts: [...get().toasts, { id, message, kind }] });
    haptic(kind === "error" ? "warning" : kind === "success" ? "success" : "light");
    window.setTimeout(() => get().dismiss(id), 2800);
    return id;
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

export function showToast(message: string, kind: ToastKind = "success") {
  return useToastStore.getState().push(message, kind);
}

export function showErrorToast(message: string) {
  return showToast(message, "error");
}

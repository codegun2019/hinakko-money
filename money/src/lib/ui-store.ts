import { create } from "zustand";

interface UIStore {
  quickAddOpen: boolean;
  openQuickAdd:  () => void;
  closeQuickAdd: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  quickAddOpen: false,
  openQuickAdd:  () => set({ quickAddOpen: true }),
  closeQuickAdd: () => set({ quickAddOpen: false }),
}));

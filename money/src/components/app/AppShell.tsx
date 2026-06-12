import type { ReactNode } from "react";
import { BottomNav } from "~/components/app/BottomNav";
import { AppFloatingActions } from "~/components/app/AppFloatingActions";
import { AppBootSplash } from "~/components/app/AppBootSplash";
import { OnboardingCoach } from "~/components/app/OnboardingCoach";
import { ToastProvider } from "~/components/ui/ToastProvider";
import { QuickAddSheet } from "~/components/transaction/QuickAddSheet";
import { useAppBootSplash } from "~/lib/useAppBootSplash";

export function AppShell({ children }: { children: ReactNode }) {
  const splash = useAppBootSplash();

  return (
    <>
      <AppBootSplash visible={splash.visible} leaving={splash.leaving} />
      <QuickAddSheet />
      <div className="fixed inset-0 flex justify-center app-shell-bg">
        <div className="app-frame relative flex h-full flex-col bg-app overflow-hidden">
          <ToastProvider />
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            {children}
          </div>
          <AppFloatingActions />
          <BottomNav />
        </div>
      </div>
      <OnboardingCoach />
    </>
  );
}

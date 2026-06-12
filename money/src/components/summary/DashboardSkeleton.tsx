import { Skeleton } from "~/components/ui/Skeleton";
import { useThemeTemplate } from "~/lib/themes/useTemplate";
import { cn } from "~/lib/format";

export function DashboardSkeleton() {
  const { isModernBanking } = useThemeTemplate();

  return (
    <div className="flex h-full min-h-0 flex-col animate-fade-in">
      <div
        className={cn(
          "safe-top-inset shrink-0 px-4 pb-3",
          isModernBanking ? "banking-hero pb-5" : "border-b border-app bg-surface"
        )}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <Skeleton className={cn("h-9 w-9", isModernBanking && "opacity-40")} rounded="lg" />
          <Skeleton className={cn("h-9 flex-1 max-w-[200px]", isModernBanking && "opacity-40")} rounded="full" />
          <Skeleton className={cn("h-9 w-9", isModernBanking && "opacity-40")} rounded="lg" />
        </div>
        <Skeleton className={cn("mb-1 h-3 w-24", isModernBanking && "opacity-30")} rounded="sm" />
        <Skeleton className={cn("mb-3 h-9 w-44", isModernBanking && "opacity-40")} rounded="lg" />
        <div className="grid grid-cols-2 gap-2.5">
          <Skeleton className={cn("h-[52px]", isModernBanking && "opacity-35")} rounded="lg" />
          <Skeleton className={cn("h-[52px]", isModernBanking && "opacity-35")} rounded="lg" />
        </div>
      </div>
      <div className={cn("border-b border-app bg-surface/95", isModernBanking && "banking-filter-bar")}>
        <div className="px-3 py-2">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-8 w-16" rounded="lg" />)}
          </div>
        </div>
        <div className="px-4 py-2.5">
          <Skeleton className="h-[42px] w-full" rounded="lg" />
        </div>
      </div>
      <div className="flex flex-col gap-3 p-4 pb-nav">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card-surface flex items-center gap-3 p-3.5">
            <Skeleton className="h-10 w-10 shrink-0" rounded="lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-3 w-2/5" />
            </div>
            <Skeleton className="h-5 w-14" />
          </div>
        ))}
      </div>
    </div>
  );
}

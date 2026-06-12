import { Skeleton } from "~/components/ui/Skeleton";

interface Props {
  withHeader?: boolean;
}

/** Generic page loading skeleton for Calendar, Report, Settings, etc. */
export function PageSkeleton({ withHeader = true }: Props) {
  return (
    <div className="flex flex-col h-full min-h-0 animate-fade-in">
      {withHeader && (
        <div className="safe-top border-b border-app bg-surface px-4 pt-3 pb-4">
          <Skeleton className="h-7 w-40 mx-auto" rounded="lg" />
        </div>
      )}
      <div className="flex flex-col gap-3 p-4 pb-nav">
        <Skeleton className="h-20 w-full" rounded="lg" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="card-surface p-4 flex items-center gap-3">
            <Skeleton className="h-11 w-11 shrink-0" rounded="lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-3 w-2/5" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

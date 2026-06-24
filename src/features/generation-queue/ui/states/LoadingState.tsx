import { Skeleton } from "@/shared/ui/skeleton";

const SKELETON_ROWS = 5;

/** Skeleton placeholders shown during the initial seed load (~600 ms). */
export function LoadingState() {
  return (
    <ul className="space-y-2.5" aria-busy="true" aria-label="Загрузка очереди">
      {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
        <li
          key={index}
          className="flex items-center gap-4 rounded-2xl border border-[hsl(var(--border))] bg-card px-4 py-3.5"
        >
          <Skeleton className="size-11 shrink-0 rounded-[10px]" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/3 max-w-sm" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="hidden h-7 w-20 rounded-full sm:block" />
          <Skeleton className="size-8 shrink-0 rounded-full" />
        </li>
      ))}
    </ul>
  );
}

import { useMemo } from "react";
import { cn } from "@/shared/lib/utils";
import { selectCounts } from "../model/selectors";
import { useQueueActions, useQueueState } from "../model/useQueue";
import type { StatusFilter } from "../model/types";

interface StatConfig {
  key: Extract<StatusFilter, "queued" | "running" | "done" | "failed">;
  label: string;
  dot: string;
  activeRing: string;
}

const STATS: StatConfig[] = [
  { key: "queued", label: "В очереди", dot: "bg-muted-foreground", activeRing: "ring-[hsl(20_17%_22%)] border-[hsl(20_17%_22%)]" },
  { key: "running", label: "Идёт", dot: "bg-primary", activeRing: "ring-primary/50 border-primary/50" },
  { key: "done", label: "Готово", dot: "bg-emerald-400", activeRing: "ring-emerald-500/40 border-emerald-500/40" },
  { key: "failed", label: "Ошибка", dot: "bg-[hsl(var(--destructive))]", activeRing: "ring-destructive/40 border-destructive/40" },
];

/** Four live counters. Tapping a card toggles the matching status filter. */
export function QueueStats() {
  const { tasks, filters } = useQueueState();
  const { setStatusFilter } = useQueueActions();
  const counts = useMemo(() => selectCounts(tasks), [tasks]);

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3" role="group" aria-label="Сводка очереди">
      {STATS.map((stat) => {
        const active = filters.status === stat.key;
        const value = counts[stat.key];
        return (
          <button
            key={stat.key}
            type="button"
            aria-pressed={active}
            onClick={() => setStatusFilter(active ? "all" : stat.key)}
            className={cn(
              "flex flex-col gap-2 rounded-2xl border bg-card p-3.5 text-left",
              "transition-all duration-200 hover:bg-[var(--bg-card-hover)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              active
                ? cn("ring-1", stat.activeRing)
                : "border-[hsl(var(--border))] hover:border-[hsl(20_17%_20%)]",
            )}
          >
            <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground">
              <span className={cn("size-1.5 rounded-full", stat.dot)} aria-hidden />
              {stat.label}
            </span>
            <span className="font-mono text-2xl font-semibold tabular-nums leading-none text-foreground">
              {value}
            </span>
          </button>
        );
      })}
    </div>
  );
}

import { TriangleAlert } from "lucide-react";
import type { GenerationTask } from "@/entities/generation-task";
import { cn } from "@/shared/lib/utils";
import { ProgressBar } from "./ProgressBar";
import { TaskStatusBadge } from "./StatusBadge";
import { TaskActions, type TaskHandlers } from "./TaskActions";
import { TaskMeta } from "./TaskMeta";
import { TaskThumb } from "./TaskThumb";

export interface TaskRowProps {
  task: GenerationTask;
  position?: number;
  handlers: TaskHandlers;
}

/** Desktop / tablet list row. Purely presentational. */
export function TaskRow({ task, position, handlers }: TaskRowProps) {
  const isRunning = task.status === "running";
  const isFailed = task.status === "failed";

  return (
    <article
      data-status={task.status}
      className={cn(
        "group flex items-center gap-4 rounded-2xl border bg-card px-4 py-3.5",
        "transition-colors duration-200 hover:bg-[var(--bg-card-hover)]",
        isRunning ? "border-primary/25" : "border-[hsl(var(--border))] hover:border-[hsl(20_17%_20%)]",
        task.status === "canceled" && "opacity-75",
      )}
    >
      <TaskThumb type={task.type} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-medium text-foreground" title={task.prompt}>
          {task.prompt}
        </p>

        {isRunning && (
          <ProgressBar
            value={task.progress}
            showValue
            animated
            className="mt-2 max-w-sm"
            aria-label={`Прогресс: ${task.prompt}`}
          />
        )}

        {isFailed && task.error && (
          <p className="mt-1.5 inline-flex items-center gap-1.5 text-[12px] text-[hsl(var(--destructive))]">
            <TriangleAlert className="size-3.5 shrink-0" aria-hidden />
            {task.error}
          </p>
        )}

        <TaskMeta task={task} position={position} className="mt-1.5" />
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <TaskStatusBadge status={task.status} className="hidden sm:inline-flex" />
        <TaskActions task={task} handlers={handlers} />
      </div>
    </article>
  );
}

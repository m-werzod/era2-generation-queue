import { TriangleAlert } from "lucide-react";
import type { GenerationTask } from "@/entities/generation-task";
import { cn } from "@/shared/lib/utils";
import { ProgressBar } from "./ProgressBar";
import { TaskStatusBadge } from "./StatusBadge";
import { TaskActions, type TaskHandlers } from "./TaskActions";
import { TaskMeta } from "./TaskMeta";
import { TaskThumb } from "./TaskThumb";

export interface TaskCardProps {
  task: GenerationTask;
  position?: number;
  handlers: TaskHandlers;
}

/** Mobile card. Purpose-built stacked layout (not a shrunken row). */
export function TaskCard({ task, position, handlers }: TaskCardProps) {
  const isRunning = task.status === "running";
  const isFailed = task.status === "failed";

  return (
    <article
      data-status={task.status}
      className={cn(
        "rounded-2xl border bg-card p-3.5",
        isRunning ? "border-primary/25" : "border-[hsl(var(--border))]",
        task.status === "canceled" && "opacity-75",
      )}
    >
      <div className="flex items-start gap-3">
        <TaskThumb type={task.type} size={48} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-2 text-[14px] font-medium leading-snug text-foreground">
              {task.prompt}
            </p>
            <TaskStatusBadge status={task.status} iconOnly className="mt-0.5 shrink-0" />
          </div>
          <TaskMeta task={task} position={position} className="mt-2" />
        </div>
      </div>

      {isRunning && (
        <ProgressBar
          value={task.progress}
          showValue
          animated
          className="mt-3"
          aria-label={`Прогресс: ${task.prompt}`}
        />
      )}

      {isFailed && task.error && (
        <p className="mt-2.5 inline-flex items-center gap-1.5 text-[12px] text-[hsl(var(--destructive))]">
          <TriangleAlert className="size-3.5 shrink-0" aria-hidden />
          {task.error}
        </p>
      )}

      <div className="mt-3 flex items-center justify-end border-t border-[hsl(var(--border))]/60 pt-2.5">
        <TaskActions task={task} handlers={handlers} />
      </div>
    </article>
  );
}

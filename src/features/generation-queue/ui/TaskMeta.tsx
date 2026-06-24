import type { ReactNode } from "react";
import { Clock3, Hourglass } from "lucide-react";
import type { GenerationTask } from "@/entities/generation-task";
import { CreditTag, ModelGlyph } from "@/shared/ui/era";
import { cn } from "@/shared/lib/utils";
import { formatEta } from "../lib/formatEta";

function Dot() {
  return <span aria-hidden className="size-0.5 rounded-full bg-current opacity-40" />;
}

/** Contextual metric: ETA while running, position while queued, length when done. */
function contextMetric(task: GenerationTask, position?: number): ReactNode | null {
  if (task.status === "running") {
    return (
      <span className="inline-flex items-center gap-1 font-mono tabular-nums">
        <Hourglass className="size-3" aria-hidden />
        {formatEta(task)}
      </span>
    );
  }
  if (task.status === "queued") {
    return (
      <span className="inline-flex items-center gap-1 font-mono tabular-nums">
        <Clock3 className="size-3" aria-hidden />
        {position ? `№${position} в очереди` : "ожидает"}
      </span>
    );
  }
  if (task.status === "done" && task.durationLabel) {
    return <span className="font-mono tabular-nums">{task.durationLabel}</span>;
  }
  return null;
}

export interface TaskMetaProps {
  task: GenerationTask;
  position?: number;
  className?: string;
}

/** One-line metadata: model pill · contextual metric · credits. */
export function TaskMeta({ task, position, className }: TaskMetaProps) {
  const metric = contextMetric(task, position);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-muted-foreground",
        className,
      )}
    >
      <span className="inline-flex items-center gap-1.5">
        <ModelGlyph name={task.modelName} size={16} />
        <span className="font-mono text-[12px] text-foreground/75">{task.modelName}</span>
      </span>
      {metric && (
        <>
          <Dot />
          {metric}
        </>
      )}
      <Dot />
      <CreditTag value={task.credits} />
    </div>
  );
}

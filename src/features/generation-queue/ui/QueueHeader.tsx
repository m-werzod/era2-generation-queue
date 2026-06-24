import { useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { selectCounts } from "../model/selectors";
import { useQueueActions, useQueueState } from "../model/useQueue";
import { pluralize } from "../lib/formatEta";

export function QueueHeader() {
  const { tasks } = useQueueState();
  const { clearDone, addRandomTask } = useQueueActions();
  const counts = useMemo(() => selectCounts(tasks), [tasks]);

  const active = counts.queued + counts.running;
  const subtitle =
    active > 0
      ? `${active} ${pluralize(active, ["активная задача", "активные задачи", "активных задач"])} · ${counts.total} всего`
      : "Нет активных генераций";

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Очередь генераций
        </h1>
        <p className="mt-1 text-sm text-muted-foreground" aria-live="polite">
          {subtitle}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={clearDone}
          disabled={counts.done === 0}
        >
          <Trash2 />
          Очистить готовые
        </Button>
        <Button size="sm" onClick={addRandomTask}>
          <Plus />
          Новая генерация
        </Button>
      </div>
    </header>
  );
}

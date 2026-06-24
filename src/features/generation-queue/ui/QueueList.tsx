import { useMemo } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { RotateCcw, X } from "lucide-react";
import { useCopyToast } from "@/features/copy-toast";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { Button } from "@/shared/ui/button";
import { hasActiveFilters, selectQueuePositions, selectVisibleTasks } from "../model/selectors";
import { useQueueActions, useQueueState } from "../model/useQueue";
import { EmptyState } from "./states/EmptyState";
import { ErrorState } from "./states/ErrorState";
import { LoadingState } from "./states/LoadingState";
import { TaskCard } from "./TaskCard";
import { TaskRow } from "./TaskRow";
import type { TaskHandlers } from "./TaskActions";

export function QueueList() {
  const state = useQueueState();
  const actions = useQueueActions();
  const copy = useCopyToast();
  const isMobile = useIsMobile();

  const handlers = useMemo<TaskHandlers>(
    () => ({
      onCancel: actions.cancel,
      onRetry: actions.retry,
      onRemove: actions.remove,
      onCopyPrompt: (task) => copy(task.prompt, "Промпт скопирован"),
      // Download is a stub: copy a shareable result link instead of a real file.
      onDownload: (task) => copy(`https://era2.ai/r/${task.id}`, "Ссылка на результат скопирована"),
    }),
    [actions, copy],
  );

  // Memoized so unrelated re-renders (and ticks while idle) don't re-sort.
  const visible = useMemo(
    () => selectVisibleTasks(state.tasks, state.filters),
    [state.tasks, state.filters],
  );
  const positions = useMemo(() => selectQueuePositions(state.tasks), [state.tasks]);

  const resetFilters = () => {
    actions.setStatusFilter("all");
    actions.setTypeFilter("all");
    actions.setSearch("");
  };

  if (state.phase === "loading") return <LoadingState />;
  if (state.phase === "error") return <ErrorState onRetry={actions.reload} />;

  const cleared = state.recentlyCleared;

  return (
    <MotionConfig reducedMotion="user">
      {/* Undo banner for "clear done" */}
      <AnimatePresence initial={false}>
        {cleared && cleared.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 12 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-between gap-3 rounded-xl border border-[hsl(var(--border))] bg-card px-4 py-2.5">
              <span className="text-sm text-muted-foreground">
                Удалено готовых:{" "}
                <span className="font-medium text-foreground">{cleared.length}</span>
              </span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={actions.undoClear}>
                  <RotateCcw />
                  Вернуть
                </Button>
                <Button
                  variant="quiet"
                  size="icon"
                  className="size-8 rounded-full"
                  aria-label="Скрыть"
                  onClick={actions.dismissUndo}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {visible.length === 0 ? (
        <EmptyState
          variant={hasActiveFilters(state.filters) ? "filtered" : "empty"}
          onReset={resetFilters}
          onCreate={actions.addRandomTask}
        />
      ) : (
        <ul className="space-y-2.5">
          <AnimatePresence initial={false} mode="popLayout">
            {visible.map((task) => (
              <motion.li
                key={task.id}
                layout="position"
                initial={{ opacity: 0, y: 8, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {isMobile ? (
                  <TaskCard task={task} position={positions[task.id]} handlers={handlers} />
                ) : (
                  <TaskRow task={task} position={positions[task.id]} handlers={handlers} />
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </MotionConfig>
  );
}

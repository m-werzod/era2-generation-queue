import type { GenerationTask, TaskStatus } from "@/entities/generation-task";
import { MAX_CONCURRENT } from "./constants";
import type { QueueFilters, QueueSummary, SortOrder } from "./types";

export interface StatusCounts {
  total: number;
  queued: number;
  running: number;
  done: number;
  failed: number;
  canceled: number;
}

/** Tally tasks by status in a single pass. */
export function selectCounts(tasks: readonly GenerationTask[]): StatusCounts {
  const counts: StatusCounts = {
    total: tasks.length,
    queued: 0,
    running: 0,
    done: 0,
    failed: 0,
    canceled: 0,
  };
  for (const task of tasks) counts[task.status] += 1;
  return counts;
}

export const selectRunning = (tasks: readonly GenerationTask[]): GenerationTask[] =>
  tasks.filter((t) => t.status === "running");

export const selectRunningCount = (tasks: readonly GenerationTask[]): number =>
  tasks.reduce((n, t) => (t.status === "running" ? n + 1 : n), 0);

/** Queued tasks in FIFO order (oldest `createdAt` first). */
export const selectQueued = (tasks: readonly GenerationTask[]): GenerationTask[] =>
  tasks.filter((t) => t.status === "queued").sort((a, b) => a.createdAt - b.createdAt);

/** True when a free slot exists and there is something waiting to fill it. */
export const canPromote = (tasks: readonly GenerationTask[]): boolean =>
  selectRunningCount(tasks) < MAX_CONCURRENT && tasks.some((t) => t.status === "queued");

/** The next queued task to start under FIFO, or `undefined`. */
export function selectNextQueued(tasks: readonly GenerationTask[]): GenerationTask | undefined {
  let next: GenerationTask | undefined;
  for (const task of tasks) {
    if (task.status !== "queued") continue;
    if (!next || task.createdAt < next.createdAt) next = task;
  }
  return next;
}

/**
 * Active tasks (running + queued) for the global status bar — running first
 * (by start time), then queued in FIFO order.
 */
export function selectActiveTasks(tasks: readonly GenerationTask[]): GenerationTask[] {
  const running = selectRunning(tasks).sort(
    (a, b) => (a.startedAt ?? 0) - (b.startedAt ?? 0),
  );
  return [...running, ...selectQueued(tasks)];
}

/** Average progress across active tasks (queued count as 0%); 0..100. */
export function selectAverageProgress(active: readonly GenerationTask[]): number {
  if (active.length === 0) return 0;
  const sum = active.reduce((acc, t) => acc + t.progress, 0);
  return Math.round(sum / active.length);
}

/** Condensed summary the status bar renders from. */
export function selectSummary(tasks: readonly GenerationTask[]): QueueSummary {
  const active = selectActiveTasks(tasks);
  return {
    activeCount: active.length,
    runningCount: selectRunningCount(tasks),
    queuedCount: active.length - selectRunningCount(tasks),
    averageProgress: selectAverageProgress(active),
  };
}

/** 1-based position of each queued task, keyed by id. */
export function selectQueuePositions(tasks: readonly GenerationTask[]): Record<string, number> {
  const positions: Record<string, number> = {};
  selectQueued(tasks).forEach((task, index) => {
    positions[task.id] = index + 1;
  });
  return positions;
}

const STATUS_SORT_WEIGHT: Record<TaskStatus, number> = {
  running: 0,
  queued: 1,
  failed: 2,
  done: 3,
  canceled: 4,
};

function compareTasks(a: GenerationTask, b: GenerationTask, sort: SortOrder): number {
  switch (sort) {
    case "newest":
      return b.createdAt - a.createdAt;
    case "oldest":
      return a.createdAt - b.createdAt;
    case "progress":
      return b.progress - a.progress || b.createdAt - a.createdAt;
    case "status":
      return (
        STATUS_SORT_WEIGHT[a.status] - STATUS_SORT_WEIGHT[b.status] ||
        b.createdAt - a.createdAt
      );
  }
}

/**
 * Tasks visible under the current filters: status chip + type facet + prompt
 * search, then sorted. Pure and side-effect free.
 */
export function selectVisibleTasks(
  tasks: readonly GenerationTask[],
  filters: QueueFilters,
): GenerationTask[] {
  const { status, type, sort, search } = filters;
  const query = search.trim().toLowerCase();

  const filtered = tasks.filter((task) => {
    if (status !== "all" && task.status !== status) return false;
    if (type !== "all" && task.type !== type) return false;
    if (query) {
      const haystack = `${task.prompt} ${task.modelName}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  return filtered.sort((a, b) => compareTasks(a, b, sort));
}

/** Whether any filter/search is narrowing the list (drives empty-state copy). */
export const hasActiveFilters = (filters: QueueFilters): boolean =>
  filters.status !== "all" || filters.type !== "all" || filters.search.trim().length > 0;

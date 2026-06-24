import type { GenType, GenerationTask } from "@/entities/generation-task";

/** Status filter chips: "Все · В очереди · Идёт · Готово · Ошибка". */
export type StatusFilter = "all" | "queued" | "running" | "done" | "failed";

/** Optional type facet: text / image / video / audio. */
export type TypeFilter = "all" | GenType;

/** Sort orders. `newest`/`oldest` are required; `status`/`progress` are extras. */
export type SortOrder = "newest" | "oldest" | "status" | "progress";

export interface QueueFilters {
  status: StatusFilter;
  type: TypeFilter;
  sort: SortOrder;
  /** Free-text prompt search (already debounced by the toolbar). */
  search: string;
}

/** Lifecycle of the initial seed load (drives loading / error screens). */
export type LoadPhase = "loading" | "ready" | "error";

export interface QueueState {
  phase: LoadPhase;
  tasks: GenerationTask[];
  filters: QueueFilters;
  /**
   * Tasks removed by the last "clear done" action, retained briefly so the
   * action can be undone. `null` when there is nothing to undo.
   */
  recentlyCleared: GenerationTask[] | null;
}

/**
 * Every transition in the queue state machine. The engine and the UI only ever
 * mutate state by dispatching these — the reducer is the single writer.
 */
export type QueueAction =
  | { type: "LOAD_START" }
  | { type: "LOAD_SUCCESS"; tasks: GenerationTask[] }
  | { type: "LOAD_ERROR" }
  | { type: "ENQUEUE"; task: GenerationTask }
  | { type: "PROMOTE"; id: string; at: number }
  | { type: "ADVANCE"; id: string; progress: number }
  | { type: "COMPLETE"; id: string; at: number }
  | { type: "FAIL"; id: string; error: string; at: number }
  | { type: "CANCEL"; id: string; at: number }
  | { type: "RETRY"; id: string; at: number }
  | { type: "REMOVE"; id: string }
  | { type: "CLEAR_DONE" }
  | { type: "UNDO_CLEAR" }
  | { type: "COMMIT_CLEAR" }
  | { type: "SET_STATUS_FILTER"; value: StatusFilter }
  | { type: "SET_TYPE_FILTER"; value: TypeFilter }
  | { type: "SET_SORT"; value: SortOrder }
  | { type: "SET_SEARCH"; value: string };

export const DEFAULT_FILTERS: QueueFilters = {
  status: "all",
  type: "all",
  sort: "newest",
  search: "",
};

/** Imperative actions exposed to the UI — the only way components mutate state. */
export interface QueueActions {
  cancel(id: string): void;
  retry(id: string): void;
  remove(id: string): void;
  clearDone(): void;
  undoClear(): void;
  dismissUndo(): void;
  enqueue(task: GenerationTask): void;
  addRandomTask(): void;
  setStatusFilter(value: StatusFilter): void;
  setTypeFilter(value: TypeFilter): void;
  setSort(value: SortOrder): void;
  setSearch(value: string): void;
  reload(): void;
}

/** Status-bar presentation derived from the count of active tasks. */
export interface QueueSummary {
  /** running + queued. */
  activeCount: number;
  runningCount: number;
  queuedCount: number;
  /** Average progress across active tasks, 0..100 (queued contribute 0). */
  averageProgress: number;
}

export type { GenType, GenerationTask };

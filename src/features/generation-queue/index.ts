// ── Provider + hooks ────────────────────────────────────────────────────────
export { QueueProvider } from "./model/QueueProvider";
export { useQueue, useQueueState, useQueueActions } from "./model/useQueue";

// ── Screen sections (composed by the widget) ────────────────────────────────
export { QueueHeader } from "./ui/QueueHeader";
export { QueueStats } from "./ui/QueueStats";
export { QueueToolbar } from "./ui/QueueToolbar";
export { QueueList } from "./ui/QueueList";

// ── Global floating status bar (mounted at app level) ───────────────────────
export { GenerationStatusBar } from "./ui/GenerationStatusBar";

// ── Types ───────────────────────────────────────────────────────────────────
export type {
  QueueState,
  QueueActions,
  QueueFilters,
  QueueSummary,
  StatusFilter,
  TypeFilter,
  SortOrder,
  LoadPhase,
} from "./model/types";

// ── Selectors (pure, reusable) ──────────────────────────────────────────────
export {
  selectCounts,
  selectSummary,
  selectActiveTasks,
  selectVisibleTasks,
  selectQueuePositions,
  hasActiveFilters,
  type StatusCounts,
} from "./model/selectors";

// ── Constants + formatters ──────────────────────────────────────────────────
export { MAX_CONCURRENT } from "./model/constants";
export {
  formatEta,
  formatEstimate,
  formatRelativeTime,
  formatCredits,
  formatPercent,
} from "./lib/formatEta";
export { createGenerationTask } from "./lib/createTask";

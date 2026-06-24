/**
 * Tunable constants for the queue engine and persistence layer. Centralized so
 * there are no magic numbers scattered across the model.
 */

/** Maximum number of tasks allowed in `running` at once. */
export const MAX_CONCURRENT = 2;

/** Master engine tick interval (ms). Progress advances once per tick. */
export const ENGINE_TICK_MS = 600;

/**
 * Random multiplier applied to each progress step so running tasks don't move
 * in perfectly even increments.
 */
export const PROGRESS_JITTER_MIN = 0.65;
export const PROGRESS_JITTER_MAX = 1.4;

/** Probability (0..1) that any given run is doomed to fail mid-flight (~15%). */
export const FAILURE_RATE = 0.15;

/**
 * A doomed run fails once its progress crosses a threshold randomly picked in
 * this window — so failures happen partway through, never at 0% or 100%.
 */
export const FAILURE_THRESHOLD_MIN = 12;
export const FAILURE_THRESHOLD_MAX = 88;

/** Simulated latency for the initial seed "fetch" (ms). */
export const INITIAL_LOAD_MS = 600;

/** localStorage key + schema version for the persisted queue. */
export const STORAGE_KEY = "era2-queue:v1";

/** Debounce window for persistence writes so we don't hit storage every tick. */
export const STORAGE_WRITE_DEBOUNCE_MS = 400;

/** How long an "Undo" affordance stays available after clearing done tasks. */
export const UNDO_WINDOW_MS = 6_000;

/** Human-readable failure reasons surfaced on failed tasks. */
export const FAILURE_REASONS: readonly string[] = [
  "Недостаточно кредитов",
  "Превышено время ожидания",
  "Модель временно недоступна",
  "Внутренняя ошибка модели",
];

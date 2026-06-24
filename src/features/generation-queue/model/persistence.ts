import type { GenerationTask, TaskStatus } from "@/entities/generation-task";
import { STORAGE_KEY } from "./constants";

const VALID_STATUSES: readonly TaskStatus[] = [
  "queued",
  "running",
  "done",
  "failed",
  "canceled",
];

const VALID_TYPES = ["text", "image", "video", "audio"] as const;

/** Light runtime guard so corrupted storage can't crash the app. */
function isGenerationTask(value: unknown): value is GenerationTask {
  if (!value || typeof value !== "object") return false;
  const t = value as Record<string, unknown>;
  return (
    typeof t.id === "string" &&
    typeof t.prompt === "string" &&
    typeof t.modelName === "string" &&
    typeof t.credits === "number" &&
    typeof t.progress === "number" &&
    typeof t.createdAt === "number" &&
    typeof t.estimatedMs === "number" &&
    typeof t.type === "string" &&
    (VALID_TYPES as readonly string[]).includes(t.type) &&
    typeof t.status === "string" &&
    (VALID_STATUSES as readonly string[]).includes(t.status as TaskStatus)
  );
}

/**
 * Reconcile a restored task. Running tasks can't keep running across a reload
 * (their timers/failure plans are gone), so we demote them back to `queued`
 * with progress reset — their original `createdAt` is preserved so FIFO order
 * is unchanged and the engine will simply pick them up again.
 */
function reconcile(task: GenerationTask): GenerationTask {
  if (task.status !== "running") return task;
  return {
    ...task,
    status: "queued",
    progress: 0,
    startedAt: undefined,
    finishedAt: undefined,
  };
}

/** Read + validate + reconcile persisted tasks. Returns null if absent/invalid. */
export function loadPersistedTasks(): GenerationTask[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const tasks = parsed.filter(isGenerationTask).map(reconcile);
    return tasks.length > 0 ? tasks : null;
  } catch {
    return null;
  }
}

/** Persist the current tasks. Failures (quota, private mode) are swallowed. */
export function savePersistedTasks(tasks: readonly GenerationTask[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    /* ignore persistence failures */
  }
}

/** Remove persisted state (used by a hard "reset" if ever needed). */
export function clearPersistedTasks(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

import type { GenerationTask } from "@/entities/generation-task";
import {
  ENGINE_TICK_MS,
  FAILURE_RATE,
  FAILURE_REASONS,
  FAILURE_THRESHOLD_MAX,
  FAILURE_THRESHOLD_MIN,
  MAX_CONCURRENT,
  PROGRESS_JITTER_MAX,
  PROGRESS_JITTER_MIN,
} from "./constants";
import { selectRunning } from "./selectors";
import type { QueueAction, QueueState } from "./types";

export interface QueueEngineDeps {
  /** Always returns the latest queue state (single source of truth). */
  getState: () => QueueState;
  dispatch: (action: QueueAction) => void;
  /** Injectable for deterministic tests. Defaults to `Math.random`. */
  random?: () => number;
  /** Injectable clock. Defaults to `Date.now`. */
  now?: () => number;
}

export interface QueueEngine {
  start: () => void;
  stop: () => void;
  /** Run a single tick synchronously — exposed for unit tests. */
  tick: () => void;
}

/** Per-run failure plan: the progress % at which a doomed run fails, or null. */
interface FailPlan {
  failAt: number | null;
}

/**
 * The queue engine drives the simulation forward. It owns no state of its own
 * besides timers and per-run failure plans — every change to the queue is a
 * dispatched action, so the reducer stays the single writer.
 *
 * Each tick it:
 *   1. advances running tasks by a jittered, type-dependent step (failing or
 *      completing them when thresholds are crossed),
 *   2. fills any free slot (up to MAX_CONCURRENT) from the queued FIFO,
 *   3. prunes failure plans for tasks that left the running set.
 */
export function createQueueEngine({
  getState,
  dispatch,
  random = Math.random,
  now = Date.now,
}: QueueEngineDeps): QueueEngine {
  let intervalId: ReturnType<typeof setInterval> | null = null;
  const failPlans = new Map<string, FailPlan>();

  const between = (min: number, max: number): number => min + random() * (max - min);

  /** Decide, once per run, whether and where it will fail (~FAILURE_RATE). */
  function planFailure(task: GenerationTask): FailPlan {
    if (random() >= FAILURE_RATE) return { failAt: null };
    // Never fail before the current progress (matters for mid-flight seed/restored runs).
    const floor = Math.max(FAILURE_THRESHOLD_MIN, task.progress + 5);
    if (floor >= FAILURE_THRESHOLD_MAX) return { failAt: null };
    return { failAt: between(floor, FAILURE_THRESHOLD_MAX) };
  }

  function ensurePlan(task: GenerationTask): FailPlan {
    let plan = failPlans.get(task.id);
    if (!plan) {
      plan = planFailure(task);
      failPlans.set(task.id, plan);
    }
    return plan;
  }

  /** Progress increment for one tick — slower for video/audio, with jitter. */
  function stepFor(task: GenerationTask): number {
    const base = (ENGINE_TICK_MS / task.estimatedMs) * 100;
    return base * between(PROGRESS_JITTER_MIN, PROGRESS_JITTER_MAX);
  }

  const pickReason = (): string =>
    FAILURE_REASONS[Math.floor(random() * FAILURE_REASONS.length)];

  function tick(): void {
    const state = getState();
    if (state.phase !== "ready") return;
    const { tasks } = state;

    // 1) Advance currently-running tasks.
    const running = selectRunning(tasks);
    const runningIds = new Set(running.map((t) => t.id));
    for (const task of running) {
      const plan = ensurePlan(task);
      const next = task.progress + stepFor(task);
      if (plan.failAt !== null && next >= plan.failAt) {
        failPlans.delete(task.id);
        dispatch({ type: "FAIL", id: task.id, error: pickReason(), at: now() });
      } else if (next >= 100) {
        failPlans.delete(task.id);
        dispatch({ type: "COMPLETE", id: task.id, at: now() });
      } else {
        dispatch({ type: "ADVANCE", id: task.id, progress: next });
      }
    }

    // 2) Fill free slots from the queued FIFO (oldest createdAt first).
    let freeSlots = MAX_CONCURRENT - running.length;
    const promoted = new Set<string>();
    while (freeSlots > 0) {
      let nextTask: GenerationTask | undefined;
      for (const task of tasks) {
        if (task.status !== "queued" || promoted.has(task.id)) continue;
        if (!nextTask || task.createdAt < nextTask.createdAt) nextTask = task;
      }
      if (!nextTask) break;
      promoted.add(nextTask.id);
      dispatch({ type: "PROMOTE", id: nextTask.id, at: now() });
      freeSlots -= 1;
    }

    // 3) Drop plans for tasks that are no longer running (done/failed/canceled/removed).
    for (const id of [...failPlans.keys()]) {
      if (!runningIds.has(id)) failPlans.delete(id);
    }
  }

  function start(): void {
    if (intervalId !== null) return;
    intervalId = setInterval(tick, ENGINE_TICK_MS);
  }

  function stop(): void {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
    failPlans.clear();
  }

  return { start, stop, tick };
}

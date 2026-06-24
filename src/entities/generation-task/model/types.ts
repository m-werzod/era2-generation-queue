import type { GenType } from "@/entities/generation";

/**
 * `GenType` ("text" | "image" | "video" | "audio") is the platform-wide
 * generation modality. It already lives in the `generation` entity, so we
 * re-export it here (type-only — erased at build) to keep a single source of
 * truth instead of duplicating the union.
 */
export type { GenType };

/**
 * Finite set of states a generation task can be in. The queue engine is a
 * state machine over these values:
 *
 *   queued ──▶ running ──▶ done
 *                  │
 *                  ├──▶ failed   (random ~15% mid-flight failure)
 *                  └──▶ canceled (user action; also queued ──▶ canceled)
 *
 * `failed` and `canceled` are retryable (back to `queued`).
 */
export type TaskStatus = "queued" | "running" | "done" | "failed" | "canceled";

/** Aspect ratios used for image / video preview placeholders. */
export type TaskAspect = "1:1" | "16:9" | "9:16" | "4:3";

/**
 * A single generation task tracked by the queue. This is the canonical domain
 * shape — reused by the engine, reducer, selectors and every UI component.
 * Timestamps are epoch milliseconds (numbers) so the whole task is trivially
 * JSON-serializable for `localStorage` persistence.
 */
export interface GenerationTask {
  readonly id: string;
  readonly type: GenType;
  /** User prompt that produced this task. */
  readonly prompt: string;
  /** Human-readable model name, e.g. "Kling 2.5 Turbo". */
  readonly modelName: string;
  /** Provider slug used to resolve an icon, e.g. "kling". */
  readonly providerId: string;
  /** Credit cost of the generation. */
  readonly credits: number;

  status: TaskStatus;
  /** Completion percentage, clamped to 0..100. */
  progress: number;

  /** Enqueue time — drives FIFO scheduling and "newest/oldest" sorting. */
  readonly createdAt: number;
  /** Set when the task enters `running`. */
  startedAt?: number;
  /** Set when the task reaches a terminal state (done/failed/canceled). */
  finishedAt?: number;

  /**
   * Estimated total processing time in ms. Varies by type (video/audio take
   * noticeably longer than text/image) and drives both the progress speed and
   * the displayed ETA.
   */
  readonly estimatedMs: number;

  /** Present only when `status === "failed"`: a human-readable reason. */
  error?: string;
  /** Output length label for video/audio, e.g. "8s" or "2:34". */
  readonly durationLabel?: string;
  /** Aspect ratio for image/video preview placeholders. */
  readonly aspect?: TaskAspect;
}

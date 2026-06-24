import type { GenType } from "./types";

/**
 * Default processing budget (ms) per modality — the single source of truth for
 * "how long does a generation of this type take". The seed and the queue
 * engine both read from here, so speed stays consistent everywhere.
 *
 * Video and audio are deliberately the slowest so the difference is visible in
 * the UI; values are tuned to stay watchable in a demo rather than mirror
 * real-world minutes.
 */
export const DEFAULT_DURATION_MS_BY_TYPE: Record<GenType, number> = {
  text: 6_000,
  image: 9_000,
  audio: 16_000,
  video: 24_000,
};

import type { GenerationTask } from "@/entities/generation-task";

const SECOND = 1_000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Russian plural picker: pluralize(2, ["минута","минуты","минут"]). */
function pluralize(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}

/** Remaining time for a running task, e.g. "~8 с" or "~2 мин". */
export function formatEta(task: Pick<GenerationTask, "estimatedMs" | "progress">): string {
  const remaining = Math.max(0, task.estimatedMs * (1 - task.progress / 100));
  if (remaining < MINUTE) {
    const seconds = Math.max(1, Math.round(remaining / SECOND));
    return `~${seconds} с`;
  }
  const minutes = Math.round(remaining / MINUTE);
  return `~${minutes} ${pluralize(minutes, ["мин", "мин", "мин"])}`;
}

/** Total processing budget as a compact label, e.g. "6 с" / "24 с". */
export function formatEstimate(estimatedMs: number): string {
  if (estimatedMs < MINUTE) return `${Math.round(estimatedMs / SECOND)} с`;
  const minutes = Math.round(estimatedMs / MINUTE);
  return `${minutes} ${pluralize(minutes, ["мин", "мин", "мин"])}`;
}

/** Relative enqueue time, e.g. "только что", "5 мин назад", "2 ч назад". */
export function formatRelativeTime(timestamp: number, nowMs: number = Date.now()): string {
  const diff = Math.max(0, nowMs - timestamp);
  if (diff < 45 * SECOND) return "только что";
  if (diff < HOUR) {
    const m = Math.round(diff / MINUTE);
    return `${m} ${pluralize(m, ["минуту", "минуты", "минут"])} назад`;
  }
  if (diff < DAY) {
    const h = Math.round(diff / HOUR);
    return `${h} ${pluralize(h, ["час", "часа", "часов"])} назад`;
  }
  const d = Math.round(diff / DAY);
  return `${d} ${pluralize(d, ["день", "дня", "дней"])} назад`;
}

/** "75 cr" style credit label (kept ASCII to read well in the mono font). */
export function formatCredits(credits: number): string {
  return `${credits} cr`;
}

/** Clamp + round a progress value for display. */
export function formatPercent(progress: number): string {
  return `${Math.round(Math.max(0, Math.min(100, progress)))}%`;
}

export { pluralize };

import type { GenerationTask } from "./types";
import { DEFAULT_DURATION_MS_BY_TYPE as ESTIMATE } from "./duration";

/**
 * Starter dataset for the queue — 11 tasks spread across every status so the
 * screen feels alive on first load: two `running` with live progress, several
 * `queued`, a few `done`, one `failed`, one `canceled`.
 *
 * `createdAt` values are staggered (oldest first) so FIFO scheduling and the
 * "newest / oldest" sort have meaningful ordering to work with.
 */

const NOW = Date.now();
const SECOND = 1_000;
const MINUTE = 60 * SECOND;

const minutesAgo = (m: number): number => NOW - m * MINUTE;

export const SEED_TASKS: readonly GenerationTask[] = [
  {
    id: "seed-01",
    type: "text",
    prompt: "Напиши короткое стихотворение про закат над морем",
    modelName: "GPT-4o",
    providerId: "chatgpt",
    credits: 5,
    status: "done",
    progress: 100,
    createdAt: minutesAgo(42),
    startedAt: minutesAgo(42),
    finishedAt: minutesAgo(41),
    estimatedMs: ESTIMATE.text,
  },
  {
    id: "seed-02",
    type: "image",
    prompt: "Архитектура будущего: башня из стекла и меди в пустыне на закате",
    modelName: "Midjourney v7",
    providerId: "midjourney",
    credits: 45,
    status: "running",
    progress: 64,
    createdAt: minutesAgo(31),
    startedAt: minutesAgo(1),
    estimatedMs: ESTIMATE.image,
    aspect: "16:9",
  },
  {
    id: "seed-03",
    type: "image",
    prompt: "Минималистичный плакат: оранжевый круг на тёмном фоне",
    modelName: "Flux 1.1 Pro",
    providerId: "flux",
    credits: 25,
    status: "done",
    progress: 100,
    createdAt: minutesAgo(28),
    startedAt: minutesAgo(28),
    finishedAt: minutesAgo(27),
    estimatedMs: ESTIMATE.image,
    aspect: "4:3",
  },
  {
    id: "seed-04",
    type: "video",
    prompt: "Капля чернил растворяется в воде, макросъёмка, медленное движение",
    modelName: "Veo 3",
    providerId: "veo",
    credits: 120,
    status: "failed",
    progress: 47,
    createdAt: minutesAgo(24),
    startedAt: minutesAgo(22),
    finishedAt: minutesAgo(21),
    estimatedMs: ESTIMATE.video,
    error: "Недостаточно кредитов",
    aspect: "9:16",
    durationLabel: "8s",
  },
  {
    id: "seed-05",
    type: "video",
    prompt: "Дрон-облёт горящего костра в горах, закат, кинематографичный свет",
    modelName: "Kling 2.5 Turbo",
    providerId: "kling",
    credits: 75,
    status: "running",
    progress: 23,
    createdAt: minutesAgo(19),
    startedAt: minutesAgo(2),
    estimatedMs: ESTIMATE.video,
    aspect: "16:9",
    durationLabel: "5s",
  },
  {
    id: "seed-06",
    type: "image",
    prompt: "Кинематографичный портрет: воин на закате, песчаная буря, золотой свет",
    modelName: "Nano Banana",
    providerId: "nano banana",
    credits: 30,
    status: "queued",
    progress: 0,
    createdAt: minutesAgo(14),
    estimatedMs: ESTIMATE.image,
    aspect: "1:1",
  },
  {
    id: "seed-07",
    type: "audio",
    prompt: "Эмбиент-трек с тёплыми синтезаторами, медленный темп, винил-шум",
    modelName: "Suno v4",
    providerId: "suno",
    credits: 60,
    status: "queued",
    progress: 0,
    createdAt: minutesAgo(11),
    estimatedMs: ESTIMATE.audio,
    durationLabel: "2:34",
  },
  {
    id: "seed-08",
    type: "text",
    prompt: "Объясни простыми словами, что такое квантовая запутанность",
    modelName: "Claude Sonnet 4.5",
    providerId: "claude",
    credits: 8,
    status: "canceled",
    progress: 18,
    createdAt: minutesAgo(9),
    startedAt: minutesAgo(8),
    finishedAt: minutesAgo(8),
    estimatedMs: ESTIMATE.text,
  },
  {
    id: "seed-09",
    type: "video",
    prompt: "Город ночью с высоты птичьего полёта, неоновые огни, дождь",
    modelName: "Sora 2",
    providerId: "sora",
    credits: 150,
    status: "queued",
    progress: 0,
    createdAt: minutesAgo(6),
    estimatedMs: ESTIMATE.video,
    aspect: "16:9",
    durationLabel: "10s",
  },
  {
    id: "seed-10",
    type: "text",
    prompt: "Слоган для кофейни в стиле минимализма",
    modelName: "Gemini 2.5 Pro",
    providerId: "gemini",
    credits: 6,
    status: "queued",
    progress: 0,
    createdAt: minutesAgo(3),
    estimatedMs: ESTIMATE.text,
  },
  {
    id: "seed-11",
    type: "audio",
    prompt: "Голос рассказчика читает короткое вступление к подкасту",
    modelName: "ElevenLabs v3",
    providerId: "elevenlabs",
    credits: 40,
    status: "done",
    progress: 100,
    createdAt: minutesAgo(2),
    startedAt: minutesAgo(2),
    finishedAt: minutesAgo(1),
    estimatedMs: ESTIMATE.audio,
    durationLabel: "0:48",
  },
];

/** Fresh deep copy of the seed — never hand out the shared frozen array. */
export function createSeedTasks(): GenerationTask[] {
  return SEED_TASKS.map((task) => ({ ...task }));
}

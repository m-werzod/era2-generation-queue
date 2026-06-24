import {
  DEFAULT_DURATION_MS_BY_TYPE,
  type GenType,
  type GenerationTask,
  type TaskAspect,
} from "@/entities/generation-task";

interface ModelOption {
  modelName: string;
  providerId: string;
  credits: number;
  aspect?: TaskAspect;
  durationLabel?: string;
}

/** Small, realistic model pool per modality for demo tasks. */
const MODELS: Record<GenType, ModelOption[]> = {
  text: [
    { modelName: "GPT-4o", providerId: "chatgpt", credits: 5 },
    { modelName: "Claude Sonnet 4.5", providerId: "claude", credits: 8 },
    { modelName: "Gemini 2.5 Pro", providerId: "gemini", credits: 6 },
  ],
  image: [
    { modelName: "Nano Banana", providerId: "nano banana", credits: 30, aspect: "1:1" },
    { modelName: "Midjourney v7", providerId: "midjourney", credits: 45, aspect: "16:9" },
    { modelName: "Flux 1.1 Pro", providerId: "flux", credits: 25, aspect: "4:3" },
  ],
  video: [
    { modelName: "Kling 2.5 Turbo", providerId: "kling", credits: 75, aspect: "16:9", durationLabel: "5s" },
    { modelName: "Veo 3", providerId: "veo", credits: 120, aspect: "9:16", durationLabel: "8s" },
    { modelName: "Sora 2", providerId: "sora", credits: 150, aspect: "16:9", durationLabel: "10s" },
  ],
  audio: [
    { modelName: "Suno v4", providerId: "suno", credits: 60, durationLabel: "2:30" },
    { modelName: "ElevenLabs v3", providerId: "elevenlabs", credits: 40, durationLabel: "0:48" },
  ],
};

const PROMPTS: Record<GenType, string[]> = {
  text: [
    "Придумай название для AI-стартапа в сфере дизайна",
    "Напиши вступление для статьи про нейросети",
    "Сократи этот абзац до одного предложения",
  ],
  image: [
    "Неоновый киберпанк-город под дождём, вид с улицы",
    "Уютная кофейня в скандинавском стиле, утренний свет",
    "Абстрактная композиция из жидкого металла, оранжевые блики",
  ],
  video: [
    "Замедленная съёмка волны, разбивающейся о скалы на закате",
    "Полёт сквозь облака к горящему горизонту",
    "Макро: капля росы скатывается по лепестку",
  ],
  audio: [
    "Драматичный оркестровый трек для трейлера",
    "Спокойный lo-fi бит для работы",
    "Голос диктора для рекламного ролика",
  ],
};

const GEN_TYPES: GenType[] = ["text", "image", "video", "audio"];

let counter = 0;
function nextId(): string {
  counter += 1;
  return `task-${Date.now().toString(36)}-${counter}`;
}

const pick = <T,>(items: T[], random: () => number): T =>
  items[Math.floor(random() * items.length)];

export interface CreateTaskOptions {
  type?: GenType;
  prompt?: string;
  random?: () => number;
  now?: () => number;
}

/**
 * Build a fresh `queued` task with sensible, type-appropriate defaults. Used by
 * the "new generation" affordance to make the queue come alive on demand.
 */
export function createGenerationTask(options: CreateTaskOptions = {}): GenerationTask {
  const random = options.random ?? Math.random;
  const now = options.now ?? Date.now;
  const type = options.type ?? pick(GEN_TYPES, random);
  const model = pick(MODELS[type], random);
  const prompt = options.prompt ?? pick(PROMPTS[type], random);

  return {
    id: nextId(),
    type,
    prompt,
    modelName: model.modelName,
    providerId: model.providerId,
    credits: model.credits,
    status: "queued",
    progress: 0,
    createdAt: now(),
    estimatedMs: DEFAULT_DURATION_MS_BY_TYPE[type],
    aspect: model.aspect,
    durationLabel: model.durationLabel,
  };
}

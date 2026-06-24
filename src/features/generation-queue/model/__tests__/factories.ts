import type { GenerationTask, TaskStatus } from "@/entities/generation-task";

let seq = 0;

/** Minimal task factory for tests — override only what a case cares about. */
export function makeTask(overrides: Partial<GenerationTask> = {}): GenerationTask {
  seq += 1;
  return {
    id: overrides.id ?? `t${seq}`,
    type: overrides.type ?? "text",
    prompt: overrides.prompt ?? "prompt",
    modelName: overrides.modelName ?? "GPT-4o",
    providerId: overrides.providerId ?? "chatgpt",
    credits: overrides.credits ?? 5,
    status: overrides.status ?? ("queued" as TaskStatus),
    progress: overrides.progress ?? 0,
    createdAt: overrides.createdAt ?? seq,
    startedAt: overrides.startedAt,
    finishedAt: overrides.finishedAt,
    estimatedMs: overrides.estimatedMs ?? 6_000,
    error: overrides.error,
    durationLabel: overrides.durationLabel,
    aspect: overrides.aspect,
  };
}

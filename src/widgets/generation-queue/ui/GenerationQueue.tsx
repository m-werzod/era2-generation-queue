import { QueueHeader, QueueList, QueueStats, QueueToolbar } from "@/features/generation-queue";

/**
 * Generation Queue screen — a thin composition of the feature's sections. All
 * behaviour lives in the feature; this widget only arranges the layout.
 */
export function GenerationQueue() {
  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-5 pb-10">
      <QueueHeader />
      <QueueStats />
      <QueueToolbar />
      <QueueList />
    </div>
  );
}

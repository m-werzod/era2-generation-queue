import { useContext } from "react";
import { QueueActionsContext, QueueStateContext } from "./context";
import type { QueueActions, QueueState } from "./types";

/**
 * Read the live queue state. Re-renders on every engine tick — use it where you
 * actually render task data (rows, stats, status bar).
 */
export function useQueueState(): QueueState {
  const state = useContext(QueueStateContext);
  if (!state) throw new Error("useQueueState must be used within a <QueueProvider>");
  return state;
}

/**
 * Read the stable action surface. Does NOT re-render on ticks, so controls that
 * only dispatch (toolbar buttons, menus) stay cheap.
 */
export function useQueueActions(): QueueActions {
  const actions = useContext(QueueActionsContext);
  if (!actions) throw new Error("useQueueActions must be used within a <QueueProvider>");
  return actions;
}

/** Convenience accessor returning both state and actions. */
export function useQueue(): QueueState & { actions: QueueActions } {
  return { ...useQueueState(), actions: useQueueActions() };
}

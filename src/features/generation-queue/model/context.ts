import { createContext } from "react";
import type { QueueActions, QueueState } from "./types";

/**
 * Split contexts: state changes every engine tick, actions never do. Keeping
 * them apart lets dispatch-only consumers subscribe without re-rendering on
 * progress updates.
 */
export const QueueStateContext = createContext<QueueState | null>(null);
export const QueueActionsContext = createContext<QueueActions | null>(null);

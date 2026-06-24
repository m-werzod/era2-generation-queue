import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import { createSeedTasks } from "@/entities/generation-task";
import {
  INITIAL_LOAD_MS,
  STORAGE_WRITE_DEBOUNCE_MS,
  UNDO_WINDOW_MS,
} from "./constants";
import { QueueActionsContext, QueueStateContext } from "./context";
import { createGenerationTask } from "../lib/createTask";
import { loadPersistedTasks, savePersistedTasks } from "./persistence";
import { createQueueEngine, type QueueEngine } from "./queueEngine";
import { initialQueueState, queueReducer } from "./queueReducer";
import type { QueueActions } from "./types";

/** Read `?failInit=1` once to let the error state be demoed deterministically. */
function shouldForceInitError(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("failInit") === "1";
}

export function QueueProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(queueReducer, initialQueueState);

  // Always-current snapshot for the engine (single source of truth, no copies).
  const stateRef = useRef(state);
  stateRef.current = state;

  const loadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Initial (and retryable) load ──────────────────────────────────────────
  const runLoad = useCallback((forceError: boolean) => {
    if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
    dispatch({ type: "LOAD_START" });
    loadTimerRef.current = setTimeout(() => {
      if (forceError) {
        dispatch({ type: "LOAD_ERROR" });
        return;
      }
      const persisted = loadPersistedTasks();
      dispatch({ type: "LOAD_SUCCESS", tasks: persisted ?? createSeedTasks() });
    }, INITIAL_LOAD_MS);
  }, []);

  useEffect(() => {
    runLoad(shouldForceInitError());
    return () => {
      if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
    };
  }, [runLoad]);

  // ── Engine lifecycle (runs only while ready) ──────────────────────────────
  const engineRef = useRef<QueueEngine | null>(null);
  if (engineRef.current === null) {
    engineRef.current = createQueueEngine({
      getState: () => stateRef.current,
      dispatch,
    });
  }

  useEffect(() => {
    if (state.phase !== "ready") return;
    const engine = engineRef.current;
    engine?.start();
    return () => engine?.stop();
  }, [state.phase]);

  // ── Debounced persistence (never write the empty loading state) ────────────
  useEffect(() => {
    if (state.phase !== "ready") return;
    const id = setTimeout(() => savePersistedTasks(state.tasks), STORAGE_WRITE_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [state.phase, state.tasks]);

  // ── Auto-commit the "undo clear" buffer after the window elapses ───────────
  useEffect(() => {
    if (!state.recentlyCleared) return;
    const id = setTimeout(() => dispatch({ type: "COMMIT_CLEAR" }), UNDO_WINDOW_MS);
    return () => clearTimeout(id);
  }, [state.recentlyCleared]);

  // ── Stable action surface (does not change between renders) ────────────────
  const actions = useMemo<QueueActions>(
    () => ({
      cancel: (id) => dispatch({ type: "CANCEL", id, at: Date.now() }),
      retry: (id) => dispatch({ type: "RETRY", id, at: Date.now() }),
      remove: (id) => dispatch({ type: "REMOVE", id }),
      clearDone: () => dispatch({ type: "CLEAR_DONE" }),
      undoClear: () => dispatch({ type: "UNDO_CLEAR" }),
      dismissUndo: () => dispatch({ type: "COMMIT_CLEAR" }),
      enqueue: (task) => dispatch({ type: "ENQUEUE", task }),
      addRandomTask: () => dispatch({ type: "ENQUEUE", task: createGenerationTask() }),
      setStatusFilter: (value) => dispatch({ type: "SET_STATUS_FILTER", value }),
      setTypeFilter: (value) => dispatch({ type: "SET_TYPE_FILTER", value }),
      setSort: (value) => dispatch({ type: "SET_SORT", value }),
      setSearch: (value) => dispatch({ type: "SET_SEARCH", value }),
      reload: () => runLoad(false),
    }),
    [runLoad],
  );

  return (
    <QueueActionsContext.Provider value={actions}>
      <QueueStateContext.Provider value={state}>{children}</QueueStateContext.Provider>
    </QueueActionsContext.Provider>
  );
}

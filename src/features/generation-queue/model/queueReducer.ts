import type { GenerationTask } from "@/entities/generation-task";
import { DEFAULT_FILTERS, type QueueAction, type QueueState } from "./types";

export const initialQueueState: QueueState = {
  phase: "loading",
  tasks: [],
  filters: DEFAULT_FILTERS,
  recentlyCleared: null,
};

const clampProgress = (value: number): number => Math.max(0, Math.min(100, value));

/** Apply `patch` to the task with `id`, returning a new array. */
function patchTask(
  tasks: GenerationTask[],
  id: string,
  patch: (task: GenerationTask) => GenerationTask,
): GenerationTask[] {
  return tasks.map((task) => (task.id === id ? patch(task) : task));
}

/**
 * Pure state machine for the queue. Every status transition lives here; the
 * engine and UI are the only callers and they go exclusively through dispatch,
 * keeping a single source of truth. Each case is defensive so an out-of-order
 * action (e.g. ADVANCE on an already-canceled task) is a safe no-op.
 */
export function queueReducer(state: QueueState, action: QueueAction): QueueState {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, phase: "loading" };

    case "LOAD_SUCCESS":
      return { ...state, phase: "ready", tasks: action.tasks };

    case "LOAD_ERROR":
      return { ...state, phase: "error" };

    case "ENQUEUE":
      return { ...state, tasks: [action.task, ...state.tasks] };

    case "PROMOTE":
      return {
        ...state,
        tasks: patchTask(state.tasks, action.id, (task) =>
          task.status === "queued"
            ? { ...task, status: "running", startedAt: action.at, progress: 0 }
            : task,
        ),
      };

    case "ADVANCE":
      return {
        ...state,
        tasks: patchTask(state.tasks, action.id, (task) =>
          task.status === "running"
            ? { ...task, progress: clampProgress(action.progress) }
            : task,
        ),
      };

    case "COMPLETE":
      return {
        ...state,
        tasks: patchTask(state.tasks, action.id, (task) =>
          task.status === "running"
            ? { ...task, status: "done", progress: 100, finishedAt: action.at }
            : task,
        ),
      };

    case "FAIL":
      return {
        ...state,
        tasks: patchTask(state.tasks, action.id, (task) =>
          task.status === "running"
            ? { ...task, status: "failed", error: action.error, finishedAt: action.at }
            : task,
        ),
      };

    case "CANCEL":
      return {
        ...state,
        tasks: patchTask(state.tasks, action.id, (task) =>
          task.status === "queued" || task.status === "running"
            ? { ...task, status: "canceled", finishedAt: action.at }
            : task,
        ),
      };

    case "RETRY":
      return {
        ...state,
        tasks: patchTask(state.tasks, action.id, (task) =>
          task.status === "failed" || task.status === "canceled"
            ? {
                ...task,
                status: "queued",
                progress: 0,
                // Re-enqueue as a fresh request: newest createdAt sends it to
                // the back of the FIFO queue and the top of "newest" sort.
                createdAt: action.at,
                error: undefined,
                startedAt: undefined,
                finishedAt: undefined,
              }
            : task,
        ),
      };

    case "REMOVE":
      return { ...state, tasks: state.tasks.filter((task) => task.id !== action.id) };

    case "CLEAR_DONE": {
      const cleared = state.tasks.filter((task) => task.status === "done");
      if (cleared.length === 0) return state;
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.status !== "done"),
        recentlyCleared: cleared,
      };
    }

    case "UNDO_CLEAR": {
      if (!state.recentlyCleared) return state;
      return {
        ...state,
        tasks: [...state.recentlyCleared, ...state.tasks],
        recentlyCleared: null,
      };
    }

    case "COMMIT_CLEAR":
      return state.recentlyCleared ? { ...state, recentlyCleared: null } : state;

    case "SET_STATUS_FILTER":
      return { ...state, filters: { ...state.filters, status: action.value } };

    case "SET_TYPE_FILTER":
      return { ...state, filters: { ...state.filters, type: action.value } };

    case "SET_SORT":
      return { ...state, filters: { ...state.filters, sort: action.value } };

    case "SET_SEARCH":
      return { ...state, filters: { ...state.filters, search: action.value } };

    default:
      return state;
  }
}

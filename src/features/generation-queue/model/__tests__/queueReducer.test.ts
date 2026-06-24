import { describe, expect, it } from "vitest";
import { initialQueueState, queueReducer } from "../queueReducer";
import type { QueueState } from "../types";
import { makeTask } from "./factories";

function stateWith(...tasks: ReturnType<typeof makeTask>[]): QueueState {
  return { ...initialQueueState, phase: "ready", tasks };
}

describe("queueReducer — transitions", () => {
  it("PROMOTE moves queued → running and stamps startedAt", () => {
    const next = queueReducer(stateWith(makeTask({ id: "a", status: "queued" })), {
      type: "PROMOTE",
      id: "a",
      at: 1234,
    });
    expect(next.tasks[0]).toMatchObject({ status: "running", startedAt: 1234, progress: 0 });
  });

  it("ADVANCE updates progress only for running tasks and clamps to 100", () => {
    const next = queueReducer(stateWith(makeTask({ id: "a", status: "running", progress: 40 })), {
      type: "ADVANCE",
      id: "a",
      progress: 150,
    });
    expect(next.tasks[0].progress).toBe(100);
  });

  it("ADVANCE is a no-op on a non-running task", () => {
    const start = stateWith(makeTask({ id: "a", status: "canceled", progress: 18 }));
    const next = queueReducer(start, { type: "ADVANCE", id: "a", progress: 90 });
    expect(next.tasks[0].progress).toBe(18);
  });

  it("COMPLETE moves running → done at 100%", () => {
    const next = queueReducer(stateWith(makeTask({ id: "a", status: "running", progress: 95 })), {
      type: "COMPLETE",
      id: "a",
      at: 9,
    });
    expect(next.tasks[0]).toMatchObject({ status: "done", progress: 100, finishedAt: 9 });
  });

  it("FAIL moves running → failed and records the reason", () => {
    const next = queueReducer(stateWith(makeTask({ id: "a", status: "running" })), {
      type: "FAIL",
      id: "a",
      error: "Недостаточно кредитов",
      at: 7,
    });
    expect(next.tasks[0]).toMatchObject({ status: "failed", error: "Недостаточно кредитов" });
  });

  it("CANCEL works from queued and running but not from done", () => {
    const fromQueued = queueReducer(stateWith(makeTask({ id: "a", status: "queued" })), {
      type: "CANCEL",
      id: "a",
      at: 1,
    });
    expect(fromQueued.tasks[0].status).toBe("canceled");

    const fromDone = queueReducer(stateWith(makeTask({ id: "b", status: "done" })), {
      type: "CANCEL",
      id: "b",
      at: 1,
    });
    expect(fromDone.tasks[0].status).toBe("done");
  });

  it("RETRY re-enqueues a failed task with a fresh createdAt and cleared error", () => {
    const start = stateWith(
      makeTask({ id: "a", status: "failed", progress: 47, error: "boom", createdAt: 100 }),
    );
    const next = queueReducer(start, { type: "RETRY", id: "a", at: 500 });
    expect(next.tasks[0]).toMatchObject({
      status: "queued",
      progress: 0,
      error: undefined,
      startedAt: undefined,
      createdAt: 500,
    });
  });

  it("REMOVE deletes the task", () => {
    const next = queueReducer(stateWith(makeTask({ id: "a" }), makeTask({ id: "b" })), {
      type: "REMOVE",
      id: "a",
    });
    expect(next.tasks.map((t) => t.id)).toEqual(["b"]);
  });
});

describe("queueReducer — clear done + undo", () => {
  it("CLEAR_DONE buffers done tasks; UNDO_CLEAR restores them", () => {
    const start = stateWith(
      makeTask({ id: "a", status: "done" }),
      makeTask({ id: "b", status: "queued" }),
      makeTask({ id: "c", status: "done" }),
    );
    const cleared = queueReducer(start, { type: "CLEAR_DONE" });
    expect(cleared.tasks.map((t) => t.id)).toEqual(["b"]);
    expect(cleared.recentlyCleared?.map((t) => t.id)).toEqual(["a", "c"]);

    const undone = queueReducer(cleared, { type: "UNDO_CLEAR" });
    expect(undone.tasks).toHaveLength(3);
    expect(undone.recentlyCleared).toBeNull();
  });

  it("COMMIT_CLEAR drops the undo buffer", () => {
    const start = stateWith(makeTask({ id: "a", status: "done" }));
    const cleared = queueReducer(start, { type: "CLEAR_DONE" });
    const committed = queueReducer(cleared, { type: "COMMIT_CLEAR" });
    expect(committed.recentlyCleared).toBeNull();
    expect(committed.tasks).toHaveLength(0);
  });
});

describe("queueReducer — load phases", () => {
  it("LOAD_SUCCESS becomes ready with the provided tasks", () => {
    const next = queueReducer(initialQueueState, {
      type: "LOAD_SUCCESS",
      tasks: [makeTask({ id: "a" })],
    });
    expect(next.phase).toBe("ready");
    expect(next.tasks).toHaveLength(1);
  });

  it("LOAD_ERROR becomes error", () => {
    expect(queueReducer(initialQueueState, { type: "LOAD_ERROR" }).phase).toBe("error");
  });
});

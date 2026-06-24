import { describe, expect, it } from "vitest";
import { createQueueEngine } from "../queueEngine";
import { FAILURE_REASONS, MAX_CONCURRENT } from "../constants";
import { initialQueueState } from "../queueReducer";
import type { QueueAction, QueueState } from "../types";
import { makeTask } from "./factories";

/** Build an engine over a fixed snapshot, capturing dispatched actions. */
function harness(tasks: ReturnType<typeof makeTask>[], random: () => number) {
  const state: QueueState = { ...initialQueueState, phase: "ready", tasks };
  const actions: QueueAction[] = [];
  const engine = createQueueEngine({
    getState: () => state,
    dispatch: (a) => actions.push(a),
    random,
    now: () => 42,
  });
  return { engine, actions };
}

const idsOf = (actions: QueueAction[], type: QueueAction["type"]) =>
  actions.filter((a) => a.type === type).map((a) => ("id" in a ? a.id : undefined));

describe("queueEngine — scheduling", () => {
  it("fills free slots from the queued FIFO, up to MAX_CONCURRENT", () => {
    const { engine, actions } = harness(
      [
        makeTask({ id: "c", status: "queued", createdAt: 300 }),
        makeTask({ id: "a", status: "queued", createdAt: 100 }),
        makeTask({ id: "b", status: "queued", createdAt: 200 }),
      ],
      () => 0.9, // > FAILURE_RATE → never plans a failure
    );

    engine.tick();

    const promoted = idsOf(actions, "PROMOTE");
    expect(promoted).toHaveLength(MAX_CONCURRENT);
    expect(promoted).toEqual(["a", "b"]); // two oldest
  });

  it("does not promote while the running cap is full", () => {
    const { engine, actions } = harness(
      [
        makeTask({ id: "r1", status: "running", progress: 10 }),
        makeTask({ id: "r2", status: "running", progress: 20 }),
        makeTask({ id: "q", status: "queued" }),
      ],
      () => 0.9,
    );

    engine.tick();

    expect(idsOf(actions, "PROMOTE")).toEqual([]);
    expect(idsOf(actions, "ADVANCE")).toHaveLength(2);
  });
});

describe("queueEngine — progress lifecycle", () => {
  it("completes a running task once it reaches 100%", () => {
    const { engine, actions } = harness(
      [makeTask({ id: "a", status: "running", progress: 99, estimatedMs: 6_000 })],
      () => 0.5,
    );

    engine.tick();

    expect(actions).toContainEqual({ type: "COMPLETE", id: "a", at: 42 });
    expect(idsOf(actions, "FAIL")).toEqual([]);
  });

  it("fails a doomed run once it crosses its failure threshold", () => {
    const { engine, actions } = harness(
      [makeTask({ id: "a", status: "running", progress: 50, estimatedMs: 6_000 })],
      () => 0.01, // < FAILURE_RATE → plans a failure at ~55%
    );

    engine.tick();

    const fail = actions.find((a) => a.type === "FAIL");
    expect(fail).toBeDefined();
    expect(fail).toMatchObject({ id: "a" });
    if (fail && fail.type === "FAIL") {
      expect(FAILURE_REASONS).toContain(fail.error);
    }
  });
});

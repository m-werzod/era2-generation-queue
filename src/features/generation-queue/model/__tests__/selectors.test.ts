import { describe, expect, it } from "vitest";
import {
  canPromote,
  selectCounts,
  selectQueued,
  selectQueuePositions,
  selectSummary,
  selectVisibleTasks,
} from "../selectors";
import { DEFAULT_FILTERS } from "../types";
import type { QueueFilters } from "../types";
import { makeTask } from "./factories";

const filtersWith = (over: Partial<QueueFilters>): QueueFilters => ({ ...DEFAULT_FILTERS, ...over });

describe("selectors — counts & summary", () => {
  it("selectCounts tallies every status", () => {
    const counts = selectCounts([
      makeTask({ status: "queued" }),
      makeTask({ status: "running" }),
      makeTask({ status: "running" }),
      makeTask({ status: "done" }),
      makeTask({ status: "failed" }),
      makeTask({ status: "canceled" }),
    ]);
    expect(counts).toMatchObject({ total: 6, queued: 1, running: 2, done: 1, failed: 1, canceled: 1 });
  });

  it("selectSummary averages progress across active tasks (queued = 0)", () => {
    const summary = selectSummary([
      makeTask({ status: "running", progress: 80 }),
      makeTask({ status: "queued", progress: 0 }),
      makeTask({ status: "done", progress: 100 }),
    ]);
    expect(summary.activeCount).toBe(2);
    expect(summary.runningCount).toBe(1);
    expect(summary.averageProgress).toBe(40); // (80 + 0) / 2
  });
});

describe("selectors — FIFO & scheduling", () => {
  it("selectQueued returns queued tasks oldest-first", () => {
    const order = selectQueued([
      makeTask({ id: "c", status: "queued", createdAt: 300 }),
      makeTask({ id: "a", status: "queued", createdAt: 100 }),
      makeTask({ id: "b", status: "queued", createdAt: 200 }),
    ]).map((t) => t.id);
    expect(order).toEqual(["a", "b", "c"]);
  });

  it("canPromote respects the MAX_CONCURRENT cap of 2", () => {
    const full = [
      makeTask({ status: "running" }),
      makeTask({ status: "running" }),
      makeTask({ status: "queued" }),
    ];
    expect(canPromote(full)).toBe(false);

    const open = [makeTask({ status: "running" }), makeTask({ status: "queued" })];
    expect(canPromote(open)).toBe(true);
  });

  it("selectQueuePositions numbers queued tasks 1..n in FIFO order", () => {
    const positions = selectQueuePositions([
      makeTask({ id: "a", status: "queued", createdAt: 10 }),
      makeTask({ id: "b", status: "queued", createdAt: 20 }),
      makeTask({ id: "r", status: "running", createdAt: 5 }),
    ]);
    expect(positions).toEqual({ a: 1, b: 2 });
  });
});

describe("selectors — filter, search & sort", () => {
  const tasks = [
    makeTask({ id: "old", status: "done", type: "image", prompt: "закат над морем", createdAt: 1 }),
    makeTask({ id: "mid", status: "running", type: "video", prompt: "дрон над горами", createdAt: 2 }),
    makeTask({ id: "new", status: "queued", type: "text", prompt: "слоган для кофейни", createdAt: 3 }),
  ];

  it("filters by status", () => {
    const ids = selectVisibleTasks(tasks, filtersWith({ status: "running" })).map((t) => t.id);
    expect(ids).toEqual(["mid"]);
  });

  it("filters by type", () => {
    const ids = selectVisibleTasks(tasks, filtersWith({ type: "text" })).map((t) => t.id);
    expect(ids).toEqual(["new"]);
  });

  it("searches the prompt case-insensitively", () => {
    const ids = selectVisibleTasks(tasks, filtersWith({ search: "ЗАКАТ" })).map((t) => t.id);
    expect(ids).toEqual(["old"]);
  });

  it("sorts newest-first and oldest-first", () => {
    expect(selectVisibleTasks(tasks, filtersWith({ sort: "newest" })).map((t) => t.id)).toEqual([
      "new",
      "mid",
      "old",
    ]);
    expect(selectVisibleTasks(tasks, filtersWith({ sort: "oldest" })).map((t) => t.id)).toEqual([
      "old",
      "mid",
      "new",
    ]);
  });
});

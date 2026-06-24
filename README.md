# ERA2 — Очередь генераций (Generation Queue)

A live, client-only **generation queue** for the ERA2 platform: tasks advance
through statuses over time, progress grows, some fail, and a global floating
status bar tracks everything from anywhere — like a browser's download manager.
There is no backend; all asynchronicity is simulated on the client.

Built into the existing ERA2 frontend (React 19 · TypeScript strict · Vite ·
Tailwind v4 · shadcn/ui) following its **Feature-Sliced Design** architecture
and **warm-coal** design system (accent `#E85420`).

---

## Run it

```bash
yarn install        # or: npm install
yarn dev            # http://localhost:8080  → open /queue
yarn build          # production build
yarn test           # unit tests (see note on the lockfile below)
```

> **Lockfile note.** The sandbox this was built in couldn't reach Yarn's CDN to
> commit the `yarn.lock` update for the newly added `vitest` dev-dependency.
> Run `yarn install` (or `npm install`) once and the lock refreshes
> automatically. App build/typecheck/lint do not depend on it.

### See every state quickly
- **Live engine** — the seed loads 2 running / 4 queued / 3 done / 1 failed /
  1 canceled and keeps moving. Watch video/audio take visibly longer.
- **New task** — “Новая генерация” enqueues a random task (great for watching
  FIFO + the 2-slot limit fill).
- **Clear + Undo** — “Очистить готовые” removes done tasks with a 6 s undo.
- **Loading / Error** — `/queue` shows a ~600 ms skeleton load. Visit
  **`/queue?failInit=1`** to force the error state; “Повторить” recovers.
- **Status bar** — leave `/queue` (e.g. go to `/`) while tasks are active to
  see the floating manager; collapses to a pill, expands, opens the queue.
- **Persistence** — reload the page: the queue is restored from `localStorage`.

---

## Architecture (FSD)

```
src/
├─ entities/
│  └─ generation-task/         # domain: types, durations, seed
│     ├─ model/{types,duration,seed}.ts
│     └─ index.ts
├─ features/
│  └─ generation-queue/        # ALL behaviour lives here
│     ├─ model/
│     │  ├─ types.ts           # QueueState, QueueAction, QueueActions, filters
│     │  ├─ constants.ts       # MAX_CONCURRENT, tick/failure/persistence knobs
│     │  ├─ queueReducer.ts    # pure state machine (single writer)
│     │  ├─ selectors.ts       # counts, FIFO, active set, filter/sort/search
│     │  ├─ queueEngine.ts     # slots, ticks, jittered progress, failures
│     │  ├─ persistence.ts     # localStorage load/save + reconciliation
│     │  ├─ context.ts         # split state/actions contexts
│     │  ├─ QueueProvider.tsx  # wires reducer + engine + persistence + load
│     │  └─ useQueue.ts        # public hooks
│     ├─ ui/                   # presentational: rows, cards, toolbar, stats,
│     │  ├─ …                  # status bar, states/, etc.
│     │  └─ states/
│     ├─ lib/{formatEta,createTask}.ts
│     └─ index.ts              # public API
├─ widgets/
│  └─ generation-queue/        # thin screen composition
├─ pages/QueuePage.tsx         # thin route page
└─ app/                        # provider + route wiring
```

**Rules honoured:** business logic only in `features/generation-queue/model`;
components are presentational and receive data + callbacks; domain types live in
`entities/generation-task`; cross-slice imports go through public `index.ts`
barrels (no deep imports); `@/` = `src/`.

**Reuse over duplication.** `GenType` is re-exported (type-only) from the
existing `generation` entity rather than redefined. The screen composes existing
primitives — `Button`, `DropdownMenu`, `Skeleton` (shadcn) and the `era`
kit (`Chip`, `CreditTag`, `getModelIcon`) — and the design tokens already in
`app/styles/styles.css`. No new color system was invented.

---

## The queue engine

`createQueueEngine({ getState, dispatch, random?, now? })` runs one `setInterval`
tick (~600 ms) and is the only place randomness/timers live. Each tick it:

1. **Advances** running tasks by a jittered step. The step is derived from the
   task's `estimatedMs`, so **video/audio are clearly slower** than text/image
   (durations are the single source of truth in
   `entities/generation-task/model/duration.ts`).
2. **Fills free slots** — at most `MAX_CONCURRENT = 2` running; the next task is
   taken from the **queued FIFO** (oldest `createdAt`).
3. **Fails ~15%** of runs. A doomed run is *planned* at promotion time (a random
   threshold), so failures happen partway through with a meaningful reason
   (“Недостаточно кредитов”, “Превышено время ожидания”, …) — never a per-tick
   coin-flip that would make long videos always fail.
4. **Cleans up** — `stop()` clears the interval and per-run failure plans;
   `cancel` flips status immediately so the next tick simply skips the task (no
   “extra” progress ticks).

The engine **never mutates state** — it only dispatches actions to the reducer,
keeping a **single source of truth**. RNG and clock are injectable, which is how
the engine is unit-tested deterministically.

### State management
`useReducer` + Context. State and actions live in **separate contexts** so
dispatch-only controls (toolbar, menus) don't re-render on every progress tick.
The reducer is a pure, defensive state machine; the engine and UI are its only
callers.

### Persistence (decision)
The queue is saved to `localStorage` (`era2-queue:v1`, debounced). On restore,
**`running` tasks are demoted to `queued`** with progress reset — their timers
and failure plans are gone, so resuming mid-flight would be misleading. Their
original `createdAt` is kept, so FIFO order is preserved and the engine simply
picks them up again.

---

## Global status bar

`GenerationStatusBar` is part of this feature and mounts once at the app level,
reading the **same store** as the page (counters/progress always match). It is
hidden when nothing is active and on `/queue` (redundant) / `/auth` (chrome-less).

- **0 active** → hidden
- **1 active** → compact card (spinner, model, mini progress + %)
- **2+ active** → expanded widget (“Генерации идут”, average %, 2–3 task
  mini-list, “Открыть очередь →”)
- **collapsed** → pill “N генераций · X%”, click to expand
- **Desktop/tablet:** floating bottom-right (24 px). **Mobile:** full-width
  bottom panel with safe-area. Spring appear/disappear, reduced-motion aware.

### Routing (decision)
The app already ships a tiny custom router (`@/shared/routing`, history + a
`navigate` event) rather than react-router. The queue is wired the same way: a
`/queue` entry in `app/router`, navigated to via the shared `useNavigate()`.

---

## Responsiveness
- **Desktop / tablet (≥768px):** list **rows** (`TaskRow`).
- **Mobile (<768px):** purpose-built **cards** (`TaskCard`), stats **2×2**,
  status chips scroll horizontally, touch-friendly actions, bottom status panel.
- Breakpoint via the existing `useIsMobile` hook. No horizontal overflow; no
  shrunken-desktop shortcuts.

## Accessibility
- Semantic HTML, focus-visible rings, `aria-label`/`aria-pressed`/`role` on
  controls, `aria-live` on the header summary, `role="progressbar"` with values.
- Full `prefers-reduced-motion` support: CSS transitions/animations use
  `motion-reduce:*`, and framer-motion runs under `MotionConfig reducedMotion`.

## Bonuses included
Undo for “clear done” · type filter + status/progress sort · optimistic,
animated insert/remove/reorder (framer-motion) · keyboard/aria/reduced-motion ·
unit tests for the engine & reducer · light theme (inherited from the design
system — toggle in the header).

## Notes
- **Fonts:** Geist / Geist Mono ship with the app (`@fontsource-variable/*`).
- **Tests:** `vitest` (node env). 25 tests cover transitions, scheduling and
  the engine. See the lockfile note above.
```

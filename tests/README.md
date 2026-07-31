# Tests

```
npm test              everything (packs + engine + app)
npm run test:packs    culture packs conform to SCHEMA.md
npm run test:engine   engine invariants + golden snapshots
npm run golden        verify the 24 snapshots
npm run check         verify build inputs exist
```

`npm test` **exits non-zero when something breaks.** The four legacy `test*.mjs` scripts
don't — they screenshot and `console.log`, so they pass whatever happens. Treat those as
exploratory until they're ported.

## The golden snapshots — read this before regenerating

`tests/goldens/` holds 24 files: **8 culture packs × 3 answer-set fixtures**, each a snapshot
of what `buildPlan()` produced — every event, every budget line and its allocation, the whole
timeline with its dated labels, and all the paperwork.

This is the contract that says the culture engine still behaves. It is the moat, and it is
the thing most likely to be broken silently by a refactor that looks unrelated.

**A drift is not a test failure to be cleared. It is a question to answer.** Either the change
was intended, or you have just altered someone's wedding budget. The runner prints the exact
fields that moved:

```
✗ sikh/home
    .allocatedTotal: 30000 → 29998
    .sections.Attire: 3889 → 3744
```

Only after confirming the change is deliberate:

```
npm run golden:write
```

and commit the regenerated snapshots **in their own commit**, so the diff is reviewable.

## Fixtures

Defined in `tests/lib/engine.mjs`. Three per pack, chosen to exercise the branches in
`buildPlan()`:

| fixture | exercises |
|---|---|
| `home` | everything answered — stated budget, priorities boosting two sections, dated timeline |
| `minimal` | nothing optional answered — `estimateBudget()` path, undated timeline |
| `destination-diy` | marrying abroad (adds `p-parish` / `p-dest` paperwork) on a blank-canvas site (adds the four `DIY_ITEMS` and three `DIY_TASKS`) |

Every fixture value is fixed and nothing reads the clock, so snapshots are stable. Goldens are
generated under `TZ=UTC` because timeline labels go through `toLocaleDateString`. Keep it that
way — a fixture that depends on today's date will drift every morning and teach everyone to
ignore the failure.

## How the engine gets tested without a browser

`tests/lib/engine.mjs` loads `src/app1.js` into a Node `vm` context with a `PACKS` global and
thin `localStorage` / `document` shims — no browser, no build step, milliseconds per run.

The one wrinkle: `let` and `const` bindings never land on a vm context's global object, so an
epilogue is appended to the source to hand back `S`, `buildPlan`, `allocate` and friends from
inside the same lexical scope. If you move a function out of `app1.js`, update that epilogue.

## Browser flows

Playwright is not a dependency, so `npm test` reports the browser suite as **SKIPPED** rather
than passing quietly. To run it:

```
npm i -D playwright && npm run build && npm test
```

It finds Chromium via `PLAYWRIGHT_BROWSERS_PATH` when that's set.

## Suites

| suite | what it guards |
|---|---|
| `packs` | the 8 culture packs conform to `SCHEMA.md` — sections, units, event refs, `shareOfBudget` sums |
| `engine` | `buildPlan()` invariants + the 24 golden snapshots |
| `state` | migration, save failure, onboarding position, the reveal flag |
| `app` | real browser flow: onboarding → reveal → home, with reloads and a forced crash |

Run one with `node tests/run.mjs <suite>`.

## State (`tests/state.mjs`)

These cover the beta-blocking defects, and the migration cases matter more than they
look: before this, `if(S.v!==2){ S = BLANK(); }` meant **any schema change silently
deleted a couple's planning** — names, date, guest list, agreed prices, ticked tasks.
The suite seeds a realistic v2 save and asserts every one of those survives.

It also asserts the things that are easy to regress and impossible to notice: a save
from a *newer* build is kept rather than wiped, an unreadable save is parked at
`weddingapp.rescued` rather than discarded, a full phone tells the couple once rather
than on every keystroke, and reopening mid-onboarding resumes at the same question.

## Sync (`tests/sync.mjs`)

The scenario in *"merge — the guest-list case"* is the bug, written down: Alex adds
three guests at 09:00; Sam, offline on the train with an older copy, ticks two tasks;
Sam's phone reconnects and writes last. Under the old whole-document sync, Alex's
three guests were gone — silently, with no undo.

The merge in `src/sync.js` is pure and has no DOM or network, so it is tested directly.
Its rule: **never lose a row.** Rows merge by id, so anything either side added
survives; where both sides edited the same row, the later `_m` stamp wins. Only genuine
scalar clashes — two different budget figures — are surfaced to the couple, and local
is held until they choose rather than silently replaced.

`touch()` sets `_m`, and is called at every mutation site that syncs (guest add/edit/
RSVP, task and paperwork ticks, custom todos, item on/off, agreed/paid/deposit). **If
you add a new synced mutation, call `touch()` on the row** — an unstamped row is treated
as older than a stamped one, so a missing stamp means that edit quietly loses.

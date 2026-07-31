# Tests

```
npm test              everything (packs + engine + worlds + state + sync + app)
npm run test:packs    culture packs conform to SCHEMA.md
npm run test:worlds   the four planner worlds are complete
npm run shots:worlds  render the 4-world screenshot matrix
npm run test:engine   engine invariants + golden snapshots
npm run golden        verify the 42 snapshots
npm run check         verify build inputs exist
```

`npm test` **exits non-zero when something breaks.** The four legacy `test*.mjs` scripts
don't — they screenshot and `console.log`, so they pass whatever happens. Treat those as
exploratory until they're ported.

## The golden snapshots — read this before regenerating

`tests/goldens/` holds 42 files: **14 culture packs × 3 answer-set fixtures**, each a snapshot
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
| `packs` | the 14 culture packs conform to `SCHEMA.md` — sections, units, event refs, `shareOfBudget` sums |
| `engine` | `buildPlan()` invariants + the 42 golden snapshots |
| `state` | migration, save failure, onboarding position, the reveal flag |
| `branches` | the 67 branch deltas merge without corrupting a plan |
| `worlds` | the four planner worlds are complete and stay distinct |
| `sync` | field-level merge — never lose a row |
| `app` | real browser flow: gate → onboarding → reveal → home, with reloads and a forced crash |

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

## Worlds (`tests/worlds.mjs`)

Four planners — Ziggy, Anneke, Rosie, Perdita. Picking one swaps the whole
design world: palette, type, card model, navigation, progress metaphor and
voice. It is not a theme toggle, and the tests exist to keep it from decaying
into one.

The expensive failure here is not a crash — it is a world that is *almost*
complete, because that looks like a design decision rather than a bug:

- **a missing voice string.** `say()` falls back to the neutral house voice, so
  Ziggy would quietly go flat for one line. The suite asserts every key in
  `VOICE` is written for all four worlds plus house — 18 keys × 5.
- **a fallback across personas.** Worse than falling back to neutral: an Anneke
  line surfacing in Ziggy's world reads as a bug to the couple and undoes the
  premise. `say()` never does it, and the suite asserts every varied key
  actually differs across the cast.
- **a token block that misses a colour**, so a screen inherits the previous
  world's palette. Every world must set all seven shared tokens.
- **the cast blurring.** Four distinct signoffs, four distinct nav models, four
  distinct progress metaphors — asserted by set size, so making two the same
  fails.

**Pack strings are never persona-varied, and the suite enforces it.** Paperwork,
customs, gotchas and timeline text are research, not voice. Rewriting them per
persona would be 1,376 rewrites and a factual-accuracy disaster — jurisdiction
-specific legal guidance delivered in a jokey register. No key in `VOICE` is
allowed to name pack content.

`npm run shots:worlds` renders the matrix — 4 worlds × (home, budget, list,
question) plus the gate. **Run it after touching `worlds.css`.** A world can pass
every assertion above and still render wrong if a selector doesn't match; only a
picture catches that. It caught three real ones: Ziggy's names rendering
dark-on-dark, the step count printing twice for Perdita, and a rose glow leaking
under Anneke's button.

## Branches (`tests/branches.mjs`)

A branch — Russian Orthodox, Gujarati Hindu, Reform Jewish — is a **delta over its
base pack**, never a second pack. It renames and drops events, adds events, items,
tasks, paperwork, customs and gotchas, and overrides terms. `applyBranch()` in
`src/app1.js` merges it so `buildPlan()` and every view see one resolved pack and
know nothing about branches.

The suite exists because a branch can corrupt a plan in ways a base pack cannot:

- an added item that unbalances `shareOfBudget` (the merge re-normalises; the test
  proves it still sums to ~1.0)
- a `dropEvents` entry that strands the items pointing at it
- a `dropEvents` or `renameEvents` id that doesn't exist in the base — a typo that
  would otherwise fail silently
- duplicate ids where a branch adds something the base already had

`mergeLikeEngine()` in the test deliberately reimplements the merge rather than
importing it. If someone changes `applyBranch()` without changing the test, the two
diverge and the suite fails — which is the point.

**Placeholder branches are counted out loud**, not hidden. A label-only branch is
allowed (it still gives the couple the right word for their tradition) but the run
prints how many there are, so "we have 67 branches" never quietly means "8 of them
do nothing".

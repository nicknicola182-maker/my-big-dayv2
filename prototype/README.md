# Prototype — four planner worlds

A clickable prototype of the persona system: the couple picks a planner before
question one, and that pick changes the whole app — skeleton, navigation,
typography, progress metaphor and voice, not just colour.

```
bundle.html     the built artifact — open it directly, no server, works offline
src/            React + TypeScript source
  world/personas.ts   the four planners: design tokens + voice table
  world/ui.tsx        world-aware primitives (card, button, option, progress, phone)
  engine.ts           culture engine ported from src/app1.js — same shares,
                      same country multipliers, same backwards-dated timeline
  data/packs.ts       four real packs, trimmed to the fields the UI renders
  screens/            gate, questions, reveal, shell (tabs), sheets
  store.tsx           app state + localStorage persistence
```

## Build

```
npm install
bash <skills>/web-artifacts-builder/scripts/bundle-artifact.sh   # → bundle.html
```

## What it demonstrates

The four worlds are **structurally** different, which is the whole point:

| | navigation | progress | cards | radii |
|---|---|---|---|---|
| Ziggy · Dressing Room | chat composer; gold stat rings are the nav | marquee bulbs | gold-ringed, floating | 18–22px |
| Anneke · Order Book | 5 letter-spaced text tabs | roman `III / IX` | ruled rows, dotted leaders | **0** |
| Rosie · Linen Table | none — the objects on the table are the nav | stitches | tilted ±2°, taped | 14–16px |
| Perdita · Monograph | 5 tabs under a 2px rule | `№ 03 / 09` | hairline entries, page refs | **0** |

Perdita never renders the script face: her `hand` token resolves to letter-spaced
caps, so "handwritten" asides become `SWEETIE, NO.` automatically rather than by
special-casing her at every call site.

## Not production

State is local only — no cloud sync, and the supplier directory is three fixed
results because the real one proxies Google Places through the Worker, which is
still undeployed. The production app remains `src/` at the repo root.

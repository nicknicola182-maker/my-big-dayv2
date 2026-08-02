# Figma design system

**File:** https://www.figma.com/design/UUqgCQgHG8qTWSGPtLA0z1 — *My Big Day — Design System*
(Nick's drafts, Nick Nicola's team)

The point of this file is that `worlds.css` is already a token system, so it maps
almost 1:1 onto Figma variables with modes. Switching the mode on a frame reskins
it exactly the way `data-world` reskins the app. Getting a codebase into that shape
is normally the hard part of a Figma design system, and it was already done.

## What exists

**Collection `World`** — five modes: `House`, `Ziggy`, `Anneke`, `Rosie`, `Perdita`.
All five were accepted on the Pro seat, so no need to split across collections.

**12 variables**, values taken from `src/worlds.css` (and `src/app.css` for House),
not eyeballed:

| group | variables | scopes |
|---|---|---|
| `colour/` | paper · card · line · ink · muted · accent · accentDeep · metal | frame fill, shape fill, text fill, stroke |
| `radius/` | card · field · button | corner radius |
| `space/` | gutter | gap, width/height |

Scopes are set explicitly — never `ALL_SCOPES` — so colours only appear in fill and
stroke pickers and radii only in corner-radius pickers.

Anneke and Perdita are `0` on all three radii and have no shadow. They are the useful
stress test: a component that survives them survives anything.

**Fonts confirmed present in Figma** — no substitution needed, the components will
match the app exactly:

- `Gloock` — Regular
- `Outfit` — Thin → Black (9 weights)
- `Nothing You Could Do` — Regular

## What is not done

Everything after the token layer:

- **Variable code syntax** (`var(--paper)` etc.) so Dev Mode round-trips to the CSS
- **Effect styles** for the four shadow models — Ziggy's gold ring, Rosie's lifted
  card, and the flat `none` of the other two
- **Text styles** from the type scale
- **Page structure** — Cover / Foundations / Components
- **Components**: card, button (primary + secondary), option row, chip, tab bar,
  stat tile — as component sets with variants, every visual property bound to a
  variable rather than hardcoded

## Two things to decide before resuming

**Ziggy's dark home is a second dimension.** His question screens are pale and his
home is near-black; in code that is `data-surface`, not `data-world`. Figma modes are
one-dimensional, so it is either a sixth mode (`Ziggy (home)`) or a second collection
aliased into the first. A sixth mode is simpler and more likely to get used —
the values are `paper #320C2E`, `card rgba(255,255,255,.06)`, `line rgba(232,190,110,.22)`,
`ink #FBEDF4`, `muted #D9A8C6`.

**Rosie's rotation** (`--w-rotate: -1.4deg`) has no clean Figma variable equivalent —
rotation can't be bound. It has to live in the component itself, or be dropped from
the Figma model and left as a code-only flourish.

## Resuming

The build is idempotent by name — a resume should query the collection and variables
by name before creating anything, and skip what exists. Nothing above needs redoing.

> Continuing the My Big Day design system build in Figma. File key
> `UUqgCQgHG8qTWSGPtLA0z1`. The `World` collection and its 12 variables already exist —
> load `figma-use` and `figma-generate-library`, inspect the file first, then continue
> from variable code syntax and effect styles before components.

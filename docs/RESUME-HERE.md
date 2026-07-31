# Wedding App — where we got to

**Paused:** 29 July 2026, part-way through Sprint 1 research.

---

## Decisions locked

| Decision | Choice |
|---|---|
| Build route | **Capacitor** — wrap the existing HTML app natively. First TestFlight in ~2 weeks, no rewrite. |
| Pricing | **Freemium, £14.99 one-off unlock.** Free: onboarding, culture pack, budget, guest count, checklist, timeline. Paid: supplier directory, enquiry sender, partner sync, PDF/Excel export, unlimited custom items and photos. Both stores take 15% under $1m/yr, so £12.74 net. |
| Backend | **Cloud accounts from day one.** Supabase. Free to 50k monthly users, then $25/month. Apple $99/yr, Google Play $25 once. |
| Launch content | **Eight packs at launch**, religion first then country underneath. Geo suggests, the couple confirms. |
| Working method | I build, Nick reviews a working build at the end of each sprint. |

---

## Done so far

- `SCHEMA.md` — the culture pack data model. This is the core IP: it defines how any tradition
  is expressed as events, budget lines, timeline, paperwork, customs and gotchas, with no
  currency figures baked in (country cost multipliers are applied by the app).
- `greek-orthodox.json` — 45 items, 12 events, 30 timeline tasks, 16 paperwork entries,
  22 customs, 20 gotchas, 34 sources. Guest range set 150 / 350 / 1500 to reflect the Cypriot
  open-invitation chairetisma.
- `roman-catholic.json` — 44 items, 11 events, 32 timeline tasks, 16 paperwork entries,
  23 customs, 17 gotchas, 28 sources.

## Still to research — six packs

1. Protestant / Anglican
2. Jewish
3. Muslim (Nikah)
4. Hindu / South Asian
5. Sikh (Anand Karaj)
6. Civil / non-religious

Each takes roughly 10–15 minutes of agent research. Prompt pattern used:
*read SCHEMA.md → research with WebSearch/WebFetch → write JSON to /home/claude/packs/&lt;id&gt;.json
→ validate it parses → return only the counts, never the JSON.*

---

## Next steps when we pick this up

1. Run the six remaining pack researchers in parallel.
2. Build the onboarding questionnaire — 14 questions, working prototype.
3. Build the culture engine that turns answers + pack + country into a populated plan.
4. Port the existing budget, directory and enquiry code onto the engine.
5. Deliver a live link Nick can test before Sprint 2.

---

## Notes carried over

- The Greek Orthodox pack researcher flagged that guest numbers, Nativity fast dates and the
  UK legal position vary by jurisdiction and were deliberately hedged rather than asserted.
- The Catholic researcher flagged Irish ceremony custom and Brazilian/Colombian/Argentine
  practice as the thinnest coverage, and that its timeline runs to 32 tasks against a 20–30 target.
- Both packs deliberately omit anything that appeared only on vendor blogs.

## Unaffected by this pause

The wedding app for Paulina is live and untouched at
https://our-wedding-budget.nicknicola182.workers.dev (service worker v20, 165 suppliers).

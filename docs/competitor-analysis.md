# Competitor Analysis — Wedding Planner Apps
**Date:** 29 July 2026 · Prepared for the Wedding App build (Sprint 1)
**Apps reviewed:** Aisly, Wedding Event Timeline Planner (Schedule Maker), Wedding Planner – Bridal Pro, Wedding Planner (Sevenlogics), Bridebook. All pricing confirmed from public App Store listings and vendor sites — nothing downloaded.

---

## 1. In-app purchase structures and cost

| App | Model | Consumer price | Traction | Notes |
|---|---|---|---|---|
| **Aisly – AI Wedding Planner** | Free + one-off lifetime unlock | **£5.99 / $5.99 / €6.99** ("Aisly Premium") | ~3.5 months old, <5 ratings per storefront, Play Store 100+ downloads | Solo developer. Own website advertises $19.99 for the web version — store price is the confirmed one. Premium gates: AI assistant, AI playlists, video uploads, themed schedules. |
| **Wedding Event Timeline Planner** (Puzzle Party) | Free + subscription | **$4.99/week, $9.99/month, $39.99/year** | 4.4★, 16 ratings | Sister app Seat Puzzle sells separate subs up to **$139.99** all-access. Aggressive weekly pricing on a tiny audience. |
| **Wedding Planner – Bridal Pro** (Adi Khader) | Free + two one-off IAPs | **$1.99 ("Wedding Planner Pro") + $2.99 ("Premium Features")** | 4.2★, 165 ratings; abandoned ~2 years | Excel export is the paid gate. |
| **Wedding Planner** (Sevenlogics) | Free + subscription | **£0.99 / $0.99** ("Premium" — period unconfirmed, likely monthly) | 4.5★, 3,659 US + 400 UK ratings; stale ~2 years | Premium only removes ads and lifts storage cap. Template app in a 10-app portfolio. |
| **Bridebook** | **Free for couples — no IAP at all** | £0 | 4.8★, 9.9k UK ratings; claims 1.9m+ weddings, 71% of UK couples | Revenue is supplier-side: venues £99–£995/month +VAT (4 tiers), suppliers £20–£99/month +VAT. Featured placement, lead access, "Power Match". |

**Reading of the market:** on the consumer side nobody is charging real money — the ceiling for a one-off unlock among these is **£5.99**, and the subscription players are tiny or abandoned. The only company making serious revenue is Bridebook, and it makes it **from suppliers, not couples**. Bridebook is free, dominant in the UK, and very good — but confirmed to have **no cultural or religious personalisation in-product** (static advice articles only).

---

## 2. Features they have that we don't

### A — Worth adding (strong fit, natural to our data model)

| Feature | Seen in | Why it earns its place |
|---|---|---|
| **Seating chart / table planner** | Aisly, Bridal Pro, Seat Puzzle | Present in nearly every competitor; Seat Puzzle charges up to $139.99 for this alone. We already hold the guest list and table-based budget lines (perTable units). Big, visual, shareable. |
| **Deposit & payment-due tracking with reminders** | Aisly (advance payments), Bridal Pro (deposits) | Natural extension of our estimated/agreed/paid budget. Wedding suppliers all take deposits; missed balance dates are a real pain point. Push notifications via Capacitor. |
| **Dietary requirements & plus-ones per guest** | Bridebook, Aisly | Cheap to add to our guest model; feeds catering counts directly. |
| **Guest import (contacts / paste a list)** | Aisly | Removes the worst onboarding chore. Capacitor contacts plugin is already in our native-features list. |
| **Day-of run sheet (minute-by-minute, per-track)** | Schedule Maker, Aisly | An entire competitor app exists just for this. We already generate the event structure from the culture pack — a run sheet is a view over data we have, plus PDF export we're already building. Multi-day traditions (Hindu, Muslim, Sikh) make ours far stronger than theirs. |
| **Countdown widget** | Aisly, Sevenlogics | Emotionally sticky, keeps the app on the home screen. Needs a small piece of native widget code per platform — worth it at Sprint 2/3, not Sprint 1. |

### B — Later / maybe (real features, weaker fit right now)

| Feature | Seen in | Position |
|---|---|---|
| Guest photo album with QR upload + shared link | Aisly | Popular, but storage costs and moderation obligations; revisit post-launch. |
| Wedding website builder | Aisly, Bridebook | A product in itself; Bridebook gives it away. Not our fight at launch. |
| Vendor contacts organiser | Sevenlogics | Light version could ride on our supplier directory ("my suppliers" list). |
| Wedding journal | Sevenlogics | Low effort, low differentiation. |
| Expert advice / inspiration content | Bridebook | Our customs & gotchas tabs are our version of this — culture-specific, which theirs isn't. Extend packs rather than build a content arm. |
| Venue brochure requests / deals | Bridebook | This is Bridebook's supplier-side business model, not a feature. Relevant only if we later monetise the supplier directory. |

### C — Skip (deliberately)

| Feature | Seen in | Why not |
|---|---|---|
| AI seating by guest personality | Aisly | Gimmick on top of a seating chart; build the chart first. |
| AI playlist generation | Aisly | Off-mission; Spotify collaborative playlists exist. |
| AI vow writing | Aisly | Off-mission; generic AI feature with no cultural depth. |
| AR floor plan | Bridal Pro | High effort, novelty value, abandoned app. |
| Apple Watch app | Sevenlogics | Maintenance burden out of proportion to use. |

---

## 3. What we have that none of them have

Confirmed against all five listings and Bridebook's site:

- **Culture packs** — 8 traditions, researched and sourced: events, budget lines, timeline, customs. No competitor personalises by tradition at all.
- **Paperwork / legal engine** — notice of marriage, religious documents, the "your ceremony may not be legally binding" warnings per country. Nobody touches this.
- **Tradition-aware budgeting** — shareOfBudget × country multipliers × guest scale, with per-tradition guest ranges (an open-invitation Cypriot 500 vs an intimate civil 20).
- **Terminology engine** — the app speaks the couple's language (priest/rabbi/imam/granthi/registrar).
- **Date warnings** — Lent, the Omer, Ramadan, muhurat. A planning-critical feature no generic app can do.
- **Multi-day event structures** — mehndi, sangeet, walima, jaggo as first-class events with budgets, not one "wedding day".

This is the moat. Bridebook wins on directory scale; we win the couple whose wedding doesn't look like the template.

---

## 4. Commercial implications for our £14.99 unlock

The locked price now has context it didn't have:

1. **Bridebook is free and claims 71% of UK couples.** We cannot win as "a better generic planner". The culture engine is the reason to exist, and marketing must lead with it.
2. **The highest consumer one-off in this set is £5.99** (Aisly, new and unproven). Our £14.99 is 2.5× that. Not necessarily wrong — none of these apps offer what our unlock offers (supplier enquiries, partner sync, export, unlimited items) — but it is untested at that level in this category.
3. Options:
   - **A. Hold £14.99** — premium positioning, defend it with the culture engine and the paid bundle's breadth. Risk: price anchoring against free Bridebook.
   - **B. £9.99** — still premium over Aisly, softer ask, likely higher conversion; revenue per install may net out higher.
   - **C. £6.99 launch price, raise later** — matches category expectations while unknown; App Store price rises are easy, cuts look bad.
   - **D. Keep £14.99 but add a £4.99/mo short-term option** — subscription for couples who only want it for the final months. Adds plumbing; both stores support it alongside a lifetime SKU.
4. **Longer term, Bridebook's model is the real prize:** supplier-side revenue (venues £99–£995/month) dwarfs consumer unlocks. Our supplier directory + enquiry sender is the seed of that. Worth keeping in the Sprint 3+ conversation.

---

*Sources: apps.apple.com listings (US/UK/DE) for each app, aislyapp.io, seatpuzzle.com, sevenlogics.com, bridebook.com/uk, partners.bridebook.com pricing pages, support.bridebook.com. Full URLs retained in research notes.*

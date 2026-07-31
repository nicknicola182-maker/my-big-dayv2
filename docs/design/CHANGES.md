# Redesign change log — screenshots batch (Nick, 29 Jul 2026)

## Round 2 (30 Jul, testing v0.2 on phone)
- [ ] Tradition picker must be NEUTRAL religion first: "Christian" (not Greek Orthodox/Catholic/Protestant at top level) → then "what kind of Christian" on the NEXT page (Orthodox / Roman Catholic / Protestant) → then existing variant page (Greek/Russian… lives here).
- [ ] Blend/dual option must be clearly reachable after choosing religious=yes (was hidden below the fold by scroll bug).
- [ ] BUG: bottom of screen cuts off and won't scroll on iPhone — fix onboarding scroll/safe-area (100dvh, min-height:0, -webkit-overflow-scrolling, safe-area padding).

GLOBAL (from screenshot 1/14):
- [ ] NEW LANDING PAGE before Q1 — inviting, loving, happy, excited; gentle animations (petals/confetti drift, soft shimmer); CTA opens into Q1.
- [ ] Selection boxes / question content vertically CENTRED in the page (not top-aligned).
- [ ] Change font throughout — romantic display serif for headings + clean sans for body (per Champagne Maximalism).
- [ ] Add colour throughout — blush→raspberry gradients, apricot gold accents, glow.
- [ ] REWRITE ALL COPY — voice: gay, larger-than-life, top-tier insta-famous wedding planner onboarding a beloved client. Warm, personal, fabulous, slightly outrageous. Applies to every question, subtitle, button and empty state.

Q1 — names screen (screenshot 1/14):
- [ ] Re-word title/sub in planner voice; centred layout; new typography.

Q1 — names screen (also from screenshot 2/14):
- [ ] ADD gate question on/after names: "Are you following a religious tradition?" Yes / No.
      Yes → tradition picker (religious packs only). No → skip picker, go straight to Civil pack path.

Q2 — tradition picker (screenshot 2/14):
- [ ] Frame as RELIGIOUS tradition choice (it follows the yes/no gate).
- [ ] Keep a "not following a tradition" escape option on the picker anyway.
- [ ] TOO DESCRIPTIVE — cut the long blurbs. One short line max per option (or name only + tiny hint). 14 questions ahead; no overload at this stage.

Q7 — guest count (screenshot 3/14):
- [ ] Replace single-figure bands with RANGES (e.g. up to 50 / 50–100 / 100–180 / 180–300 / 300–500 / 500+ — scaled per pack).
- [ ] ADD MANUAL INPUT — type an exact number (e.g. 250). Big gaps like 180→500 lose real answers; exact number wins over any band.

Q3 — within that tradition (screenshot 4/14):
- [ ] Add an "Other" option to every variant list (all packs).
- [ ] Copy in the excitable planner voice (reinforces global rewrite).

Q2b — blended traditions screen (screenshot 5/14):
- [ ] REMOVE "lead tradition" / "second tradition" wording — confrontational hierarchy.
- [ ] Reframe as "your tradition" and "your partner's tradition" (equal billing). Engine still needs a primary for budget/timeline — pick it neutrally (e.g. "whose traditions shape the ceremony day?" asked warmly, or merge without ranking language on screen).

Q6 — date (screenshot 6/14):
- [ ] Centre the content vertically (confirms global centring rule applies here too).

Q8 — budget (screenshot 7/14):
- [ ] Replace single figures with RANGES (e.g. under €10k / €10–20k / €20–35k / €35–60k / €60k+ scaled to country).
- [ ] ADD MANUAL ENTRY — type exact budget.
- [ ] REMOVE "about typical for Cyprus" claim — don't assert "typical", it's not defensible. Neutral labels only.

Q10 — reception (screenshot 8/14):
- [ ] REMOVE "At home" and "Just a small meal" options — not the target buyer.
- [ ] ADD "Help me decide later" option.
- [ ] ADD manual entry — type their own venue type/name.

Budget tab (screenshot 9/14 — main app, not onboarding):
- [ ] Free tier is TOO GENEROUS in budget tab — tighten what free users get (e.g. deposit/balance-due tracking becomes premium; free keeps agreed/paid basics).
- [ ] ADD a "Find me a…" button per budget item/category (Find me a photographer, Find me a florist…) — LOCKED premium feature, feeds the supplier directory. Visible padlock so free users see what they're missing.

(await screenshots 10–14)

# Culture Pack Schema

A "pack" is the content that populates a couple's wedding plan once they have answered the
onboarding questions. One pack per faith/tradition. Country modifiers sit on top.

Write your pack as **valid JSON** to `/home/claude/packs/<id>.json`.

```jsonc
{
  "id": "roman-catholic",                  // kebab-case, stable, never changes
  "name": "Roman Catholic",                // shown in the picker
  "shortName": "Catholic",
  "faithGroup": "Christian",               // Christian | Jewish | Muslim | Hindu | Sikh | Buddhist | None | Other
  "blurb": "One sentence a couple would recognise as theirs.",
  "commonCountries": ["IT","IE","PL","PH","US","GB","ES","MX","BR"],  // ISO-3166 alpha-2
  "typicalGuests": { "low": 80, "typical": 150, "high": 300 },
  "typicalDays": 1,                        // number of days the celebration usually spans

  // ---------------------------------------------------------------- terminology
  // The app swaps these words throughout the UI so it speaks the couple's language.
  "terms": {
    "officiant": "priest",
    "ceremonyVenue": "church",
    "ceremony": "nuptial mass",
    "bestMan": "best man",
    "maidOfHonour": "maid of honour",
    "reception": "reception",
    "firstDance": "first dance",
    "witnesses": "witnesses"
  },

  // ---------------------------------------------------------------- events
  // The distinct occasions the celebration is made of, in order.
  // The app builds the day plan and the budget sections from these.
  "events": [
    {
      "id": "rehearsal",
      "name": "Rehearsal and rehearsal dinner",
      "when": "Day before",                // plain English, relative to the wedding day
      "optional": true,
      "default": true,                     // is it on by default when the pack loads
      "description": "One or two sentences a couple would find useful.",
      "hosts": "Traditionally the groom's family"   // or "" if not applicable
    }
  ],

  // ---------------------------------------------------------------- budget lines
  // The line items that appear in the plan. This is the heart of the pack.
  // costBand is a rough share of total spend, NOT a currency figure —
  // the app applies country cost multipliers separately.
  "items": [
    {
      "id": "church-fee",
      "name": "Church offering",
      "section": "Ceremony",               // Ceremony | Reception | Attire | Flowers & Styling |
                                           // Photos & Film | Music & Entertainment | Stationery |
                                           // Transport | Rings & Gifts | Beauty | Extras
      "event": "ceremony",                 // matches an events[].id, or "" for the whole wedding
      "note": "Plain English explanation for the couple.",
      "essential": true,                   // true = on by default, false = optional extra
      "shareOfBudget": 0.01,               // approximate fraction of a typical total (all items ~= 1.0)
      "unit": "fixed",                     // fixed | perGuest | perTable | perPerson | perHour
      "supplierCategory": "Church",        // used to group the supplier directory
      "religiousRequirement": true         // true if the faith requires it, false if cultural/optional
    }
  ],

  // ---------------------------------------------------------------- timeline
  // The checklist. monthsBefore counts back from the wedding day.
  "timeline": [
    { "monthsBefore": 12, "task": "Meet the priest and book the church", "critical": true },
    { "monthsBefore": 6,  "task": "Complete the pre-marriage course", "critical": true }
  ],

  // ---------------------------------------------------------------- paperwork
  // What the couple legally and religiously must do. Very high value, often missed.
  "paperwork": [
    { "item": "Baptismal certificate issued within the last 6 months", "who": "Both", "note": "" }
  ],

  // ---------------------------------------------------------------- customs
  // Traditions worth explaining. Shown as a reference tab, not costed.
  "customs": [
    { "name": "The unity candle", "description": "One or two sentences.", "optional": true }
  ],

  // ---------------------------------------------------------------- warnings
  // Things that catch couples out. Plain, practical.
  "gotchas": [
    "Some dioceses will not permit a wedding during Lent — check early."
  ],

  "sources": ["https://...", "https://..."]   // where the tradition detail came from
}
```

## Rules

1. **Accuracy over completeness.** If you are not sure a custom is real, leave it out. This app is
   sold to couples planning the most important day of their lives; an invented tradition is worse
   than a missing one.
2. **No currency figures.** Use `shareOfBudget`. Country pricing is applied by the app.
3. **Neutral, warm, plain English.** No marketing language, no emoji. Write as if to a couple who
   know their own tradition better than you do — informative, never patronising.
4. **Respect internal variation.** Where practice differs by country or denomination, say so in the
   note rather than picking one and presenting it as universal.
5. Aim for **25–45 budget items**, **6–15 events**, **20–30 timeline tasks**.
6. Cite your sources.

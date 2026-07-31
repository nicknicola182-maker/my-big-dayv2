/* Loads the culture engine (src/app1.js) in isolation, with no DOM and no browser.
 *
 * app1.js is a classic script that expects a global PACKS (injected by build.py) and
 * a browser environment. We give it a vm context with PACKS and thin shims, then
 * append an epilogue that hands back the engine's internals — `let`/`const` bindings
 * never land on a vm context's global object, so the epilogue has to run inside the
 * same lexical scope to see them. */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Read packs the same way build.py does — minus `sources`, which never ships. */
export function loadPacks() {
  const dir = path.join(ROOT, 'packs');
  const packs = {};
  for (const file of fs.readdirSync(dir).filter(n => n.endsWith('.json')).sort()) {
    const pack = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    delete pack.sources;
    packs[pack.id] = pack;
  }
  return packs;
}

const EPILOGUE = `globalThis.__engine = {
  get S(){ return S; },
  set S(v){ S = v; },
  BLANK, buildPlan, allocate, buildRunsheet, estimateBudget, budgetRanges, guestRanges,
  countryOf, localEventName, monthLabel, niceRound, pack, PRIORITIES, COUNTRIES
};`;

export function createEngine() {
  const store = new Map();
  const ctx = {
    PACKS: loadPacks(),
    console,
    localStorage: {
      getItem: k => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: k => store.delete(k),
    },
    document: { getElementById: () => null, querySelector: () => null, addEventListener() {} },
    window: {},
    navigator: { language: 'en-GB' },
  };
  ctx.globalThis = ctx;
  vm.createContext(ctx);

  const src = fs.readFileSync(path.join(ROOT, 'src', 'app1.js'), 'utf8');
  vm.runInContext(`${src}\n${EPILOGUE}`, ctx, { filename: 'src/app1.js' });
  return ctx.__engine;
}

/* ── fixtures ─────────────────────────────────────────────────────────────
 * Three answer-sets per pack, chosen to exercise the branches in buildPlan():
 *   home        — everything answered, budget stated, priorities boosting two sections
 *   minimal     — nothing optional answered; budget must be estimated, timeline undated
 *   destination — marrying abroad (drives the extra paperwork) on a DIY site
 *                 (drives DIY_ITEMS + DIY_TASKS)
 * Every value is fixed. Nothing here may depend on the clock, or goldens will drift. */

export const FIXTURES = [
  {
    name: 'home',
    ans: {
      n1: 'Alex', n2: 'Sam',
      country: 'GB', homeCountry: 'GB',
      dateISO: '2027-06-12',
      guests: 150,
      priorities: ['Food & drink', 'Photography & film'],
      style: 'Traditional',
    },
    budgetTotal: 30000,
  },
  {
    name: 'minimal',
    ans: { n1: 'Alex', n2: 'Sam', country: 'GB' },
    budgetTotal: null, // → estimateBudget()
  },
  {
    name: 'destination-diy',
    ans: {
      n1: 'Alex', n2: 'Sam',
      country: 'CY', homeCountry: 'GB',
      dateISO: '2027-09-04',
      guests: 300,
      venueDIY: true,
      priorities: ['Music & dancing'],
    },
    budgetTotal: null,
  },
];

/** Build one plan. Returns the whole state object so callers can snapshot freely. */
export function buildFor(engine, packId, fixture) {
  const S = engine.BLANK();
  S.ans = { packId, ...fixture.ans };
  engine.S = S;
  S.cur = engine.countryOf(S.ans.country || 'GB')[2];
  S.budgetTotal = fixture.budgetTotal ?? engine.estimateBudget();
  engine.buildPlan();
  return S;
}

/** The snapshot shape. This is the contract: if any of it moves, the engine moved. */
export function snapshot(S) {
  const p = S.plan;
  const sections = {};
  for (const i of p.items) {
    if (!i.on) continue;
    sections[i.section] = (sections[i.section] || 0) + i.alloc;
  }
  return {
    packId: S.ans.packId,
    currency: S.cur,
    budgetTotal: S.budgetTotal,
    counts: {
      events: p.events.length,
      items: p.items.length,
      itemsOn: p.items.filter(i => i.on).length,
      timeline: p.timeline.length,
      paperwork: p.paperwork.length,
      runsheet: S.runsheet.length,
    },
    allocatedTotal: p.items.reduce((n, i) => n + i.alloc, 0),
    sections: Object.fromEntries(Object.entries(sections).sort(([a], [b]) => a.localeCompare(b))),
    events: p.events.map(e => ({ id: e.id, name: e.name })),
    items: p.items.map(i => ({
      id: i.id, name: i.name, section: i.section,
      on: i.on, religious: i.religious, share: i.share, alloc: i.alloc,
    })),
    timeline: p.timeline.map(t => ({ id: t.id, mb: t.mb, critical: t.critical, when: t.when, task: t.task })),
    paperwork: p.paperwork.map(pp => ({ id: pp.id, who: pp.who, item: pp.item })),
  };
}

export const goldenPath = (packId, fixtureName) =>
  path.join(ROOT, 'tests', 'goldens', `${packId}.${fixtureName}.json`);

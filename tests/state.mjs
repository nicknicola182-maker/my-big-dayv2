/* State-layer tests: migration, save failure, onboarding position, reveal.
 *
 * These are the beta-blocking defects. The worst of them silently deleted a couple's
 * planning on any schema change, so the migration cases below matter more than they look.
 * Exported as a suite so tests/run.mjs can fold the results into its own count. */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { ROOT, loadPacks } from './lib/engine.mjs';

const EPILOGUE = `globalThis.__state = {
  get S(){ return S; }, set S(v){ S = v; },
  BLANK, load, save, migrate, SCHEMA_V, STORE_KEY
};`;

/** A fresh app1.js instance with a controllable localStorage. */
function boot({ seed = null, failWrites = false, failWith = 'QuotaExceededError' } = {}) {
  const store = new Map();
  if (seed !== null) store.set('weddingapp', seed);
  const toasts = [];
  const ctx = {
    PACKS: loadPacks(),
    console: { ...console, error() {} },   // expected failures shouldn't spam the run
    toast: m => toasts.push(m),
    localStorage: {
      getItem: k => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => {
        if (failWrites && k === 'weddingapp') { const e = new Error('quota'); e.name = failWith; throw e; }
        store.set(k, String(v));
      },
      removeItem: k => store.delete(k),
    },
    document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {} },
    window: {}, navigator: { language: 'en-GB' },
  };
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'src', 'app1.js'), 'utf8') + '\n' + EPILOGUE, ctx, { filename: 'src/app1.js' });
  return { api: ctx.__state, store, toasts };
}

/** A realistic v2 save — the shape shipped to real couples. */
const V2_SAVE = JSON.stringify({
  v: 2, unlocked: false, onboarded: true, seenLanding: true,
  ans: { n1: 'Alex', n2: 'Sam', packId: 'greek-orthodox', country: 'CY', dateISO: '2027-06-12', guests: 300 },
  plan: { events: [{ id: 'ceremony', name: 'The crowning' }], items: [{ id: 'church-fee', on: true, alloc: 500, agreed: 450 }], timeline: [{ id: 't0', done: true }], paperwork: [] },
  guests: [{ id: 'g1', name: 'Yiayia', rsvp: 'yes' }],
  tables: [], runsheet: [], budgetTotal: 42000, cur: 'EUR', tab: 'budget', accOpen: { Ceremony: true },
});

export function run({ describe, ok, eq, group }) {
  describe('state — migration (the data-loss defect)');
  {
    const { api } = boot({ seed: V2_SAVE });
    api.load();
    const S = api.S;
    eq(S.v, 4, 'v2 save migrates all the way to v4');
    eq(S.ans.n1, 'Alex', 'names survive');
    eq(S.ans.packId, 'greek-orthodox', 'tradition survives');
    eq(S.budgetTotal, 42000, 'budget survives');
    eq(S.guests?.length, 1, 'guest list survives');
    eq(S.plan?.items?.[0]?.agreed, 450, 'agreed prices survive');
    eq(S.plan?.timeline?.[0]?.done, true, 'ticked tasks survive');
    eq(S.tab, 'budget', 'current tab survives');
    ok(S.revealSeen === true, 'already-onboarded couple is not sent back through the reveal');
    eq(S.obIx, 0, 'obIx is introduced');
    ok(Array.isArray(S.photos) && Array.isArray(S.customTodos), 'previously-undeclared keys get defaults');
    eq(S.worldId, null, 'and lands in the neutral world rather than being sent to the gate');
    group('v2 → v4', 'nothing lost across two migration steps');
  }
  {
    /* The case the planner worlds actually create: a couple who is already deep
       in their plan when the four worlds ship. They must not be thrown back to a
       gate screen, and above all they must not lose anything. */
    const V3_SAVE = JSON.stringify({
      v: 3, unlocked: true, onboarded: true, seenLanding: true, revealSeen: true, obIx: 0,
      ans: { n1: 'Priya', n2: 'Dev', packId: 'hindu', country: 'GB', dateISO: '2027-08-21' },
      plan: { events: [{ id: 'baraat', name: 'Baraat' }], items: [{ id: 'mandap', on: true, alloc: 2000, agreed: 1850, paid: true }],
              timeline: [{ id: 't1', done: true }], paperwork: [{ id: 'p1', done: true }] },
      guests: [{ id: 'g1', name: 'Auntie', rsvp: 'yes' }, { id: 'g2', name: 'Raj' }],
      tables: [{ id: 'tb1', seats: ['g1'] }], runsheet: [], customTodos: [{ id: 'c1', done: true }],
      photos: [], albumCode: 'ABC123', cloud: { id: 'x', token: 'y' },
      budgetTotal: 31000, budgetEstimated: false, cur: 'GBP', tab: 'guests', accOpen: {}, listFilter: 'all', _pushedAt: 0,
    });
    const { api } = boot({ seed: V3_SAVE });
    api.load();
    const S = api.S;
    eq(S.v, 4, 'v3 save migrates to v4');
    eq(S.worldId, null, 'an existing couple keeps the neutral world — not bounced to the gate');
    eq(S.ans.n1, 'Priya', 'names survive');
    eq(S.ans.packId, 'hindu', 'tradition survives');
    eq(S.budgetTotal, 31000, 'budget survives');
    eq(S.guests?.length, 2, 'guest list survives');
    eq(S.plan?.items?.[0]?.agreed, 1850, 'agreed prices survive');
    ok(S.plan?.items?.[0]?.paid === true, 'payments survive');
    eq(S.plan?.timeline?.[0]?.done, true, 'ticked tasks survive');
    eq(S.plan?.paperwork?.[0]?.done, true, 'ticked paperwork survives');
    eq(S.customTodos?.[0]?.done, true, 'custom todos survive');
    eq(S.tables?.length, 1, 'seating plan survives');
    eq(S.albumCode, 'ABC123', 'album code survives');
    ok(S.cloud && S.cloud.id === 'x', 'cloud pairing survives — they are not logged out');
    ok(S.unlocked === true, 'and they are still unlocked — they paid');
    group('v3 → v4', 'the worlds ship without disturbing a plan in progress');
  }
  {
    // The old code did `if(S.v!==2){ S = BLANK(); }` — this is that case.
    const { api, store } = boot({ seed: JSON.stringify({ v: 99, ans: { n1: 'Alex' }, budgetTotal: 1234 }) });
    api.load();
    ok(api.S.ans.n1 === 'Alex', 'a save from a NEWER build is kept, not wiped');
    ok(!store.has('weddingapp.rescued'), 'and not needlessly rescued');
  }
  {
    const { api, store } = boot({ seed: '{ this is not json' });
    api.load();
    eq(api.S.v, 4, 'corrupt JSON falls back to a blank plan');
    ok(store.has('weddingapp.rescued'), 'and the unreadable save is parked, not discarded');
  }
  {
    const { api, store } = boot({ seed: JSON.stringify({ v: 1, ans: { n1: 'Alex' } }) });
    api.load();
    eq(api.S.v, 4, 'a version with no migration path still boots');
    ok(store.get('weddingapp.rescued')?.includes('Alex'), 'and is preserved verbatim for recovery');
  }
  {
    const { api } = boot({ seed: null });
    api.load();
    eq(api.S.v, 4, 'first run starts blank at the current version');
    ok(api.S.revealSeen === false, 'a new couple has not seen the reveal');
  }

  describe('state — save failure is surfaced');
  {
    const { api, toasts } = boot({ failWrites: true });
    api.load();
    api.S = api.BLANK();
    api.save();
    ok(toasts.length === 1, 'a full phone tells the couple', `got ${toasts.length} message(s)`);
    ok(/storage is full/i.test(toasts[0] || ''), 'and says what to do about it', toasts[0]);
    api.save(); api.save();
    eq(toasts.length, 1, 'but does not nag on every keystroke');
  }
  {
    const { api, toasts } = boot({ failWrites: true, failWith: 'SecurityError' });
    api.load(); api.S = api.BLANK(); api.save();
    ok(/couldn't save/i.test(toasts[0] || ''), 'a non-quota failure is reported too', toasts[0]);
  }

  describe('state — onboarding position persists');
  {
    const { api, store } = boot();
    api.load();
    api.S.seenLanding = true;
    api.S.obIx = 6;
    api.S.ans.n1 = 'Alex';
    api.save();
    // simulate closing and reopening the app
    const again = boot({ seed: store.get('weddingapp') });
    again.api.load();
    eq(again.api.S.obIx, 6, 'reopening resumes at the same question');
    eq(again.api.S.ans.n1, 'Alex', 'with answers intact');
  }
}

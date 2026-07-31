/* Sync tests: the merge, and the conflict protocol.
 *
 * The defect these guard against: plan sync sent the whole document and let the
 * newest write win. Twelve guests added on one phone vanished when the other
 * phone — offline, holding an older plan — reconnected and wrote last.
 *
 * The scenario in `merge — the guest-list case` is that exact story. */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { ROOT } from './lib/engine.mjs';

function loadSync() {
  const ctx = { console, module: { exports: {} } };
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'src', 'sync.js'), 'utf8'), ctx, { filename: 'src/sync.js' });
  return ctx.module.exports;
}

const guest = (id, name, rsvp = 'pending', m = 0) => ({ id, name, rsvp, side: 0, diet: '', plus: 0, _m: m });
const task = (id, done = false, m = 0) => ({ id, task: `task ${id}`, done, _m: m });

export function run({ describe, ok, eq, group }) {
  const { touch, mergeRows, mergeState } = loadSync();

  describe('sync — merge, the guest-list case');
  {
    // 09:00 — Alex adds three guests on their phone.
    const alex = {
      v: 3, budgetTotal: 30000, cur: 'GBP',
      guests: [guest('g1', 'Yiayia', 'yes', 900), guest('g2', 'Uncle Tak', 'pending', 900), guest('g3', 'The Georgious', 'pending', 900)],
      plan: { items: [], timeline: [task('t0'), task('t1')], paperwork: [] },
      customTodos: [], tables: [], photos: ['local.jpg'],
    };
    // 08:00 — Sam, offline on the train, ticks two tasks on a copy that predates the guests.
    const sam = {
      v: 3, budgetTotal: 30000, cur: 'GBP',
      guests: [],
      plan: { items: [], timeline: [task('t0', true, 800), task('t1', true, 800)], paperwork: [] },
      customTodos: [], tables: [], photos: [],
    };

    const { state, clashes } = mergeState(alex, sam);
    eq(state.guests.length, 3, "Alex's three guests survive the merge");
    ok(state.guests.every(g => g.name), 'and are intact');
    ok(state.plan.timeline.every(t => t.done), "Sam's two ticks survive as well");
    eq(clashes.length, 0, 'and nothing needed a human');
    group('both sides kept', '3 guests + 2 ticks');
  }
  {
    // Same story in the other direction — whoever pushes second must not win by default.
    const alex = { guests: [guest('g1', 'Yiayia', 'yes', 900)], plan: { items: [], timeline: [task('t0')], paperwork: [] } };
    const sam = { guests: [], plan: { items: [], timeline: [task('t0', true, 800)], paperwork: [] } };
    const a = mergeState(alex, sam).state;
    const b = mergeState(sam, alex).state;
    eq(a.guests.length, 1, 'merge keeps the guest whichever side initiates');
    eq(b.guests.length, 1, 'and the other way round');
    ok(a.plan.timeline[0].done && b.plan.timeline[0].done, 'the tick survives both ways');
  }

  describe('sync — row-level resolution');
  {
    const mine = [guest('g1', 'Yiayia', 'yes', 2000)];
    const theirs = [guest('g1', 'Yiayia', 'no', 1000)];
    eq(mergeRows(mine, theirs)[0].rsvp, 'yes', 'the more recent edit to a row wins');
    eq(mergeRows(theirs, mine)[0].rsvp, 'yes', 'regardless of which side is merging');
  }
  {
    const merged = mergeRows([guest('g1', 'A', 'yes', 5)], [guest('g2', 'B', 'no', 5)]);
    eq(merged.length, 2, 'rows only one side has are kept');
  }
  {
    // An untouched row can't be the more recent edit.
    const stamped = { id: 'g1', name: 'edited', _m: 1 };
    const bare = { id: 'g1', name: 'never touched' };
    eq(mergeRows([bare], [stamped])[0].name, 'edited', 'a stamped row beats an unstamped one');
    eq(mergeRows([stamped], [bare])[0].name, 'edited', 'in both directions');
  }
  {
    const merged = mergeRows([guest('g1', 'A')], [null, { name: 'no id' }, guest('g2', 'B')]);
    eq(merged.length, 2, 'malformed rows are dropped rather than thrown on');
  }

  describe('sync — scalars a couple must decide');
  {
    const { state, clashes } = mergeState({ budgetTotal: 30000 }, { budgetTotal: 42000 });
    eq(clashes.length, 1, 'two different budgets raise one clash');
    eq(clashes[0].label, 'the budget', 'named in words the couple would use');
    eq(state.budgetTotal, 30000, 'local is held until they choose — never silently replaced');
  }
  {
    const { clashes } = mergeState({ budgetTotal: 30000 }, { budgetTotal: 30000 });
    eq(clashes.length, 0, 'agreeing on the budget is not a clash');
  }
  {
    // Paid once, on both phones — this one resolves itself.
    eq(mergeState({ unlocked: false }, { unlocked: true }).state.unlocked, true, 'an unlock on either phone unlocks both');
    eq(mergeState({ unlocked: false }, { unlocked: true }).clashes.length, 0, 'and asks nobody');
  }

  describe('sync — merge safety');
  {
    const mine = { photos: ['mine.jpg'], cloud: { id: 'me', token: 't', rev: 4 }, guests: [] };
    const theirs = { photos: ['theirs.jpg'], cloud: { id: 'them', token: 'x', rev: 9 }, guests: [] };
    const { state } = mergeState(mine, theirs);
    eq(state.photos.length, 1, 'photos are never merged in from the other phone');
    eq(state.photos[0], 'mine.jpg', 'they stay local');
    eq(state.cloud.id, 'me', 'credentials are never taken from the remote copy');
  }
  {
    const mine = { guests: [guest('g1', 'A')], plan: { items: [], timeline: [], paperwork: [] } };
    const before = JSON.stringify(mine);
    mergeState(mine, { guests: [guest('g2', 'B')], plan: { items: [], timeline: [], paperwork: [] } });
    eq(JSON.stringify(mine), before, 'merging does not mutate the inputs');
  }
  {
    eq(mergeState({ guests: [guest('g1', 'A')] }, null).state.guests.length, 1, 'a missing remote is not a merge');
    eq(mergeState(null, { guests: [guest('g1', 'A')] }).state.guests.length, 1, 'nor a missing local');
  }
  {
    const t0 = Date.now();
    const r = touch({ id: 'x' });
    ok(r._m >= t0, 'touch stamps a row with the current time');
    eq(touch(null), null, 'and tolerates nothing');
  }

  describe('sync — the worker contract');
  {
    const src = fs.readFileSync(path.join(ROOT, 'backend', 'src', 'index.js'), 'utf8');
    ok(/If-Match/.test(src), 'the worker reads If-Match');
    ok(/conflict: true/.test(src) && /409/.test(src), 'and answers a stale write with 409 + the current plan');
    ok(/rev=excluded\.rev/.test(src), 'and advances the revision on write');
    const schema = fs.readFileSync(path.join(ROOT, 'backend', 'schema.sql'), 'utf8');
    ok(/rev INTEGER NOT NULL DEFAULT 0/.test(schema), 'plans.rev exists for fresh deployments');
    ok(/ALTER TABLE plans ADD COLUMN rev/.test(schema), 'with the ALTER noted for an existing one');

    const client = fs.readFileSync(path.join(ROOT, 'src', 'app2.js'), 'utf8');
    ok(/"If-Match": String\(S\.cloud\.rev\)/.test(client), 'the client sends the rev it last saw');
    ok(/r\.status === 409/.test(client), 'handles 409 by merging');
    ok(/S\._dirty = true/.test(client), 'marks unsent changes dirty');
    ok(/addEventListener\("online"/.test(client), 'and retries when the phone comes back online');
    ok(!/S = Object\.assign\(remote/.test(client), 'the whole-document overwrite is gone');
    group('protocol', 'rev · If-Match · 409 · merge · retry');
  }
}

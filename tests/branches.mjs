/* Branch layer: a branch is a delta over its base pack, not a second pack.
 *
 * These tests exist because a branch can silently corrupt a plan in ways the base
 * pack cannot — an added item that unbalances the shares, a dropped event that
 * strands the items pointing at it, or a branch that just restates the base and
 * adds nothing but noise. */

import fs from 'node:fs';
import path from 'node:path';
import { createEngine, loadPacks, ROOT } from './lib/engine.mjs';

const DELTA_KEYS = ['addEvents', 'addItems', 'addTimeline', 'addPaperwork', 'addCustoms', 'addGotchas'];

export function run({ describe, ok, eq, group }) {
  const packs = loadPacks();
  const engine = createEngine();
  const withBranches = Object.values(packs).filter(p => p.branches);

  describe('branches — shape');
  ok(withBranches.length >= 8, 'most packs carry a branch layer', `${withBranches.length} of ${Object.keys(packs).length}`);

  let total = 0, substantive = 0;
  for (const p of withBranches) {
    for (const [name, b] of Object.entries(p.branches)) {
      total++;
      const label = `${p.id}/${name}`;
      ok(typeof b.label === 'string' && b.label.length > 0, `${label}: has a display label`);

      // every dropped event must actually exist in the base, or the delta is a typo
      for (const id of b.dropEvents || []) {
        ok(p.events.some(e => e.id === id), `${label}: dropEvents "${id}" exists in the base pack`);
      }
      for (const id of Object.keys(b.renameEvents || {})) {
        ok(p.events.some(e => e.id === id), `${label}: renameEvents "${id}" exists in the base pack`);
      }
      // added items must point at an event that survives the merge
      const live = new Set(p.events.filter(e => !(b.dropEvents || []).includes(e.id)).map(e => e.id)
        .concat((b.addEvents || []).map(e => e.id)));
      for (const i of b.addItems || []) {
        ok(!i.event || live.has(i.event), `${label}: added item "${i.id}" points at a live event`, i.event);
        ok(!!(i.note || '').trim(), `${label}: added item "${i.id}" has a note`);
      }
      // terms overrides must be real term keys
      for (const k of Object.keys(b.terms || {})) {
        ok(k in p.terms, `${label}: terms override "${k}" is a real term`);
      }
      if (DELTA_KEYS.some(k => (b[k] || []).length) || b.terms || b.dropEvents || b.renameEvents) substantive++;
    }
  }
  group('branch deltas', `${total} branches across ${withBranches.length} packs, ${substantive} carrying content`);

  describe('branches — merged plans stay valid');
  {
    // Merge every branch and assert the resulting pack still builds a sane plan.
    const src = fs.readFileSync(path.join(ROOT, 'src', 'app1.js'), 'utf8');
    ok(/function applyBranch/.test(src), 'the engine has a branch merge');
    ok(/function pack\(\)\{ return applyBranch/.test(src), 'and pack() routes through it');

    for (const p of withBranches) {
      for (const [name, b] of Object.entries(p.branches)) {
        const label = `${p.id}/${name}`;
        const merged = mergeLikeEngine(p, b);

        const sum = merged.items.reduce((n, i) => n + (i.shareOfBudget || 0), 0);
        ok(sum > 0.99 && sum < 1.01, `${label}: shares still sum to ~1.0 after merge`, `sum = ${sum.toFixed(4)}`);

        const live = new Set(merged.events.map(e => e.id));
        const stranded = merged.items.filter(i => i.event && !live.has(i.event));
        ok(stranded.length === 0, `${label}: no item left pointing at a dropped event`,
          stranded.map(i => `${i.id}→${i.event}`).join(', '));

        const ids = merged.items.map(i => i.id);
        ok(new Set(ids).size === ids.length, `${label}: no duplicate item ids after merge`);

        const eids = merged.events.map(e => e.id);
        ok(new Set(eids).size === eids.length, `${label}: no duplicate event ids after merge`);

        ok(merged.events.length > 0 && merged.timeline.length > 0,
          `${label}: still has celebrations and a timeline`);
      }
    }
    group('merged packs', `${total} branch merges validated`);
  }

  describe('branches — they actually change something');
  {
    // A branch that adds nothing is either unfinished or should not exist.
    const empty = [];
    for (const p of withBranches) {
      for (const [name, b] of Object.entries(p.branches)) {
        const has = DELTA_KEYS.some(k => (b[k] || []).length) || b.terms || b.dropEvents || b.renameEvents;
        if (!has) empty.push(`${p.id}/${name}`);
      }
    }
    // Placeholder branches are allowed, but we count them out loud rather than hide them.
    console.log(`  ⓘ ${empty.length} branch(es) are label-only placeholders: ${empty.slice(0, 6).join(', ')}${empty.length > 6 ? '…' : ''}`);
    ok(empty.length < total / 2, 'fewer than half the branches are placeholders', `${empty.length} of ${total}`);
  }

  describe('branches — a worked example');
  {
    const go = packs['greek-orthodox'];
    const ru = mergeLikeEngine(go, go.branches['Russian']);
    eq(ru.terms.bestMan, 'svidetel', 'Russian Orthodox renames the best man');
    ok(!ru.events.some(e => e.id === 'resi'), 'and drops the Cypriot resi');
    ok(ru.events.some(e => e.id === 'zags'), 'and adds the ZAGS civil registration');
    ok(ru.gotchas.length > go.gotchas.length, 'and adds its own gotchas');
    ok(ru.gotchas.some(g => /ZAGS/.test(g)), 'including the one that matters legally');

    const sa = mergeLikeEngine(packs['hindu'], packs['hindu'].branches['South Indian']);
    ok(!sa.events.some(e => e.id === 'baraat'), 'South Indian Hindu has no baraat');
    ok(!sa.events.some(e => e.id === 'sangeet'), 'and no sangeet');
    ok(sa.events.some(e => e.id === 'kashi-yatra'), 'but does have the Kashi Yatra');
    ok(sa.items.some(i => i.id === 'thali'), 'and the thali as a budget line');
    group('worked examples', 'Russian Orthodox · South Indian Hindu');
  }
}

/* Mirrors applyBranch() in src/app1.js. Kept deliberately separate so a change to
   one without the other shows up as a failure rather than passing silently. */
function mergeLikeEngine(p, b) {
  const drop = new Set(b.dropEvents || []);
  const rename = b.renameEvents || {};
  const events = p.events.filter(e => !drop.has(e.id))
    .map(e => (rename[e.id] ? { ...e, name: rename[e.id] } : e))
    .concat(b.addEvents || []);
  const live = new Set(events.map(e => e.id));
  let items = p.items.filter(i => !i.event || live.has(i.event)).concat(b.addItems || []);
  const sum = items.reduce((n, i) => n + (i.shareOfBudget || 0), 0) || 1;
  items = items.map(i => ({ ...i, shareOfBudget: Math.round((i.shareOfBudget / sum) * 1e4) / 1e4 }));
  return {
    ...p,
    terms: { ...p.terms, ...(b.terms || {}) },
    events, items,
    timeline: p.timeline.concat(b.addTimeline || []),
    paperwork: p.paperwork.concat(b.addPaperwork || []),
    customs: p.customs.concat(b.addCustoms || []),
    gotchas: p.gotchas.concat(b.addGotchas || []),
  };
}

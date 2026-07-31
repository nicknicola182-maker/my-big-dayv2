#!/usr/bin/env node
/* The test runner. Asserts, reports, and exits non-zero on failure.
 *
 *   node tests/run.mjs              everything available
 *   node tests/run.mjs packs        one suite (packs | engine | app)
 *
 * Paths are resolved from the repo, not hardcoded, so this runs anywhere.
 * If Playwright isn't installed the browser suite is reported SKIPPED — loudly,
 * and it still counts as not-run rather than passing quietly. */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createEngine, loadPacks, FIXTURES, buildFor, ROOT } from './lib/engine.mjs';

/* ── tiny harness ─────────────────────────────────────────────── */
let pass = 0, fail = 0, skip = 0;
const failures = [];
let suite = '';

const describe = name => { suite = name; console.log(`\n${name}`); };
const ok = (cond, what, detail) => {
  if (cond) { pass++; return true; }
  fail++; failures.push(`${suite} › ${what}${detail ? `\n      ${detail}` : ''}`);
  console.log(`  ✗ ${what}${detail ? `\n      ${detail}` : ''}`);
  return false;
};
const eq = (actual, expected, what) =>
  ok(actual === expected, what, actual === expected ? '' : `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
const group = (name, n) => console.log(`  ✓ ${name}${n != null ? ` (${n})` : ''}`);
const skipped = (what, why) => { skip++; console.log(`  ⊘ SKIPPED ${what} — ${why}`); };

const only = process.argv[2];
const wants = s => !only || only === s;

/* ── packs: conformance to SCHEMA.md ──────────────────────────── */
const SECTIONS = ['Ceremony', 'Reception', 'Attire', 'Flowers & Styling', 'Photos & Film',
  'Music & Entertainment', 'Stationery', 'Transport', 'Rings & Gifts', 'Beauty', 'Extras'];
const UNITS = ['fixed', 'perGuest', 'perTable', 'perPerson', 'perHour'];
const TOP_KEYS = ['id', 'name', 'shortName', 'faithGroup', 'blurb', 'commonCountries',
  'typicalGuests', 'typicalDays', 'terms', 'events', 'items', 'timeline',
  'paperwork', 'customs', 'gotchas', 'sources'];
const TERM_KEYS = ['officiant', 'ceremonyVenue', 'ceremony', 'bestMan', 'maidOfHonour',
  'reception', 'firstDance', 'witnesses'];

if (wants('packs')) {
  describe('packs — conformance to SCHEMA.md');
  const dir = path.join(ROOT, 'packs');
  const files = fs.readdirSync(dir).filter(n => n.endsWith('.json')).sort();
  ok(files.length === 8, 'eight packs present', `found ${files.length}`);

  for (const file of files) {
    const p = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    const id = p.id;
    eq(`${id}.json`, file, `${file}: id matches filename`);

    const missing = TOP_KEYS.filter(k => !(k in p));
    ok(missing.length === 0, `${id}: all 16 top-level keys`, missing.join(', '));

    const missingTerms = TERM_KEYS.filter(k => !(k in (p.terms || {})));
    ok(missingTerms.length === 0, `${id}: all 8 terms`, missingTerms.join(', '));

    const badSection = p.items.filter(i => !SECTIONS.includes(i.section));
    ok(badSection.length === 0, `${id}: item sections are in the controlled vocabulary`,
      badSection.map(i => `${i.id}="${i.section}"`).join(', '));

    const badUnit = p.items.filter(i => i.unit && !UNITS.includes(i.unit));
    ok(badUnit.length === 0, `${id}: item units valid`, badUnit.map(i => `${i.id}="${i.unit}"`).join(', '));

    const eventIds = new Set(p.events.map(e => e.id));
    const dangling = p.items.filter(i => i.event && !eventIds.has(i.event));
    ok(dangling.length === 0, `${id}: every item.event resolves to an event`,
      dangling.map(i => `${i.id}→${i.event}`).join(', '));

    const share = p.items.reduce((n, i) => n + (i.shareOfBudget || 0), 0);
    ok(share > 0.99 && share < 1.01, `${id}: shareOfBudget sums to ~1.0`, `sum = ${share.toFixed(4)}`);

    const g = p.typicalGuests || {};
    ok(g.low <= g.typical && g.typical <= g.high, `${id}: typicalGuests low ≤ typical ≤ high`,
      JSON.stringify(g));

    const negative = p.timeline.filter(t => !(t.monthsBefore >= 0));
    ok(negative.length === 0, `${id}: timeline monthsBefore is non-negative`, `${negative.length} bad`);

    const noNote = p.items.filter(i => !i.note || !i.note.trim());
    ok(noNote.length === 0, `${id}: every item has a note for the couple`,
      noNote.map(i => i.id).join(', '));

    const ids = p.items.map(i => i.id);
    ok(new Set(ids).size === ids.length, `${id}: item ids unique`,
      `${ids.length - new Set(ids).size} duplicate(s)`);

    group(`${id}`, `${p.events.length} events, ${p.items.length} items, ${p.timeline.length} tasks, ${p.paperwork.length} paperwork`);
  }
}

/* ── engine: invariants, then the golden contract ─────────────── */
if (wants('engine')) {
  describe('engine — invariants');
  const engine = createEngine();
  const packIds = Object.keys(loadPacks()).sort();

  for (const packId of packIds) {
    for (const fx of FIXTURES) {
      const S = buildFor(engine, packId, fx);
      const label = `${packId}/${fx.name}`;
      const plan = S.plan;
      const allocated = plan.items.reduce((n, i) => n + i.alloc, 0);

      // Allocation must spend the budget, to within rounding across the enabled items.
      const drift = Math.abs(allocated - S.budgetTotal);
      ok(drift <= plan.items.filter(i => i.on).length, `${label}: allocation matches the budget`,
        `budget ${S.budgetTotal}, allocated ${allocated}, drift ${drift}`);

      ok(plan.items.every(i => i.on || i.alloc === 0), `${label}: switched-off items cost nothing`);
      ok(plan.items.every(i => i.alloc >= 0), `${label}: no negative allocations`);
      ok(plan.events.length > 0, `${label}: at least one celebration`);
      ok(plan.timeline.length > 0 && plan.paperwork.length > 0, `${label}: timeline and paperwork populated`);

      // Timeline is ordered furthest-out first — the app renders it in this order.
      const ordered = plan.timeline.every((t, i, a) => i === 0 || a[i - 1].mb >= t.mb);
      ok(ordered, `${label}: timeline sorted furthest-out first`);

      ok(S.budgetTotal > 0, `${label}: budget is positive`, `got ${S.budgetTotal}`);
    }
  }
  group('invariants', `${packIds.length} packs × ${FIXTURES.length} fixtures`);

  describe('engine — golden snapshots');
  try {
    execFileSync(process.execPath, [path.join(ROOT, 'tests', 'golden.mjs')],
      { stdio: 'inherit', env: { ...process.env, TZ: 'UTC' } });
    pass++;
  } catch {
    fail++;
    failures.push('engine — golden snapshots › snapshots drifted (see above)');
  }
}

/* ── app: browser flows ───────────────────────────────────────── */
if (wants('app')) {
  describe('app — browser flows');
  const dist = path.join(ROOT, 'dist', 'index.html');
  if (!ok(fs.existsSync(dist), 'dist/index.html exists', 'run: python3 build.py')) {
    // fall through; nothing else can run
  } else {
    let chromium = null;
    try { ({ chromium } = await import('playwright')); } catch {}

    if (!chromium) {
      skipped('browser flows', 'playwright not installed — run: npm i -D playwright');
    } else {
      const exe = process.env.PLAYWRIGHT_BROWSERS_PATH
        ? path.join(process.env.PLAYWRIGHT_BROWSERS_PATH, 'chromium')
        : undefined;
      const browser = await chromium.launch(exe && fs.existsSync(exe) ? { executablePath: exe } : {});
      const shots = path.join(ROOT, 'tests', 'shots');
      fs.mkdirSync(shots, { recursive: true });

      const page = await browser.newPage({ viewport: { width: 400, height: 820 } });
      const errors = [];
      page.on('pageerror', e => errors.push(`PAGEERROR: ${e.message}`));
      page.on('console', m => { if (m.type() === 'error') errors.push(`CONSOLE: ${m.text()}`); });

      await page.goto(`file://${dist}`);
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(shots, 'landing.png') });

      ok(await page.locator('#app').count() > 0, 'app root renders');
      const state = await page.evaluate(() => (typeof S === 'undefined' ? null : { v: S.v, onboarded: S.onboarded }));
      ok(state !== null, 'global state initialises');
      eq(state?.v, 2, 'state schema version is 2');
      ok(errors.length === 0, 'no console or page errors on boot', errors.slice(0, 3).join('\n      '));

      await browser.close();
      group('boot', 'landing screen');
      skipped('onboarding / reveal / tab flows',
        'the four legacy smoke scripts still cover these without assertions — porting them is Phase 0 follow-up');
    }
  }
}

/* ── report ───────────────────────────────────────────────────── */
console.log(`\n${'─'.repeat(60)}`);
if (failures.length) {
  console.log(`FAILURES (${failures.length}):`);
  for (const f of failures) console.log(`  • ${f}`);
}
console.log(`${fail ? 'FAIL' : 'PASS'} — ${pass} passed, ${fail} failed, ${skip} skipped`);
process.exit(fail ? 1 : 0);

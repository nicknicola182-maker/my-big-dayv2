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

/* A suite that throws is a failure with a summary, not a dead process. */
const guardAsync = async (name, fn) => {
  try { return await fn(); }
  catch (e) {
    fail++;
    failures.push(`${name} › suite threw: ${e && e.message || e}`);
    console.log(`  ✗ suite threw: ${(e && e.message || e).toString().split('\n')[0]}`);
  }
};

const guard = (name, fn) => {
  try { return fn(); }
  catch (e) {
    fail++;
    const msg = `${name} › suite threw: ${e && e.message || e}`;
    failures.push(msg);
    console.log(`  ✗ suite threw: ${e && e.message || e}`);
  }
};

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

/* ── state: persistence, migration, recovery ──────────────────── */
if (wants('state')) {
  const { run: runState } = await import('./state.mjs');
  guard('state', () => runState({ describe, ok, eq, group }));
}

/* ── app: browser flows ───────────────────────────────────────── */
if (wants('app')) await guardAsync('app — browser flows', async () => {
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
      const boot = await page.evaluate(() =>
        (typeof S === 'undefined' ? null : { v: S.v, schema: SCHEMA_V, onboarded: S.onboarded, revealSeen: S.revealSeen }));
      ok(boot !== null, 'global state initialises');
      eq(boot?.v, boot?.schema, 'a fresh save is written at the current schema version');
      ok(boot?.revealSeen === false, 'a new couple has not seen the reveal');
      ok(errors.length === 0, 'no console or page errors on boot', errors.slice(0, 3).join('\n      '));
      group('boot', 'landing screen');

      /* Walk the Greek Orthodox path to the reveal, then reload mid-reveal.
         Before this phase, obIx lived outside state and the reveal had no flag —
         a reload lost your place, and lost the reveal permanently. */
      const settle = 140;
      const cont = async () => { await page.locator('text=Continue').first().click(); await page.waitForTimeout(settle); };
      const tap  = async sel => { await page.locator(sel).first().click(); await page.waitForTimeout(settle); };
      await tap("text=Let's begin, my loves");
      await page.fill('#n1', 'Alex'); await page.fill('#n2', 'Sam');
      await cont();

      const midway = await page.evaluate(() => S.obIx);
      ok(midway > 0, 'onboarding position is tracked in saved state', `obIx = ${midway}`);
      await page.reload(); await page.waitForTimeout(400);
      const resumed = await page.evaluate(() => ({ obIx: S.obIx, n1: S.ans.n1 }));
      eq(resumed.obIx, midway, 'reloading resumes at the same question');
      eq(resumed.n1, 'Alex', 'with answers intact');

      await tap('.opt:has-text("Yes — a religious")'); await cont();
      await tap('.opt:has-text("Christian")'); await cont();
      await tap('.opt:has-text("Orthodox")'); await cont();
      await tap('.opt:has-text("Greek / Cypriot")'); await cont();
      await page.selectOption('#csel', 'CY'); await cont();
      await tap('text=Skip for now');
      await page.fill('#wdate', '2027-09-18'); await cont();
      await page.fill('#gexact', '250'); await cont();
      await page.locator('.opt').nth(2).click(); await page.waitForTimeout(settle); await cont();
      await tap('.opt:has-text("Our own church")'); await cont();
      await tap(".opt:has-text(\"I've got the place\")");
      await page.fill('#rother', 'Ktima Oasis Limassol'); await cont();
      await cont();                                          // events: keep defaults
      await tap('text=Food & drink'); await tap('text=Photography & film'); await cont();
      await tap('.opt:has-text("Glamorous")'); await cont();
      await tap('text=Just me for now');
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(shots, 'reveal.png') });

      const atReveal = await page.evaluate(() => ({ onboarded: S.onboarded, revealSeen: S.revealSeen, cur: S.cur, budget: S.budgetTotal }));
      ok(atReveal.onboarded, 'onboarding completes');
      ok(atReveal.revealSeen === false, 'the reveal is marked unseen until dismissed');
      eq(atReveal.cur, 'EUR', 'currency follows the country');
      ok(atReveal.budget > 0, 'a budget is set', `got ${atReveal.budget}`);
      ok(await page.locator('text=Show me my wedding').count() > 0, 'the reveal is on screen');

      await page.reload(); await page.waitForTimeout(500);
      ok(await page.locator('text=Show me my wedding').count() > 0,
        'reloading mid-reveal returns to the reveal, not past it');

      await tap('text=Show me my wedding');
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(shots, 'home.png') });
      const home = await page.evaluate(() => ({ revealSeen: S.revealSeen, tab: S.tab, items: S.plan.items.length }));
      ok(home.revealSeen === true, 'dismissing the reveal records it');
      eq(home.tab, 'home', 'lands on home');
      ok(home.items > 0, 'the plan is populated', `${home.items} items`);
      ok(await page.locator('#tabbar').count() > 0, 'the tab bar renders');

      /* The error boundary: force a throw and confirm the couple gets a way out. */
      await page.evaluate(() => { window.__viewsHome = VIEWS.home; VIEWS.home = () => { throw new Error('boom'); }; render(); });
      await page.waitForTimeout(200);
      ok(await page.locator('text=Something went wrong').count() > 0, 'a render crash shows a recovery screen');
      ok(await page.locator('text=Download my plan').count() > 0, 'and offers the plan as a download');
      await page.evaluate(() => { VIEWS.home = window.__viewsHome; render(); });
      ok(await page.locator('#tabbar').count() > 0, 'and the app recovers afterwards');

      await browser.close();
      group('flow', 'onboarding → reveal → home, with reloads');
    }
  }
});

/* ── report ───────────────────────────────────────────────────── */
console.log(`\n${'─'.repeat(60)}`);
if (failures.length) {
  console.log(`FAILURES (${failures.length}):`);
  for (const f of failures) console.log(`  • ${f}`);
}
console.log(`${fail ? 'FAIL' : 'PASS'} — ${pass} passed, ${fail} failed, ${skip} skipped`);
process.exit(fail ? 1 : 0);

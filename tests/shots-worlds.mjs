/* Screenshot matrix: 4 worlds × the surfaces that carry their identity.
 *
 * Run: node tests/shots-worlds.mjs   → tests/shots/worlds/
 *
 * This is the check that a token block actually landed. A world can pass every
 * assertion in worlds.mjs and still render in the previous world's palette if a
 * selector is wrong — only a picture catches that. */

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(ROOT, 'dist', 'index.html');
const out = path.join(ROOT, 'tests', 'shots', 'worlds');
fs.mkdirSync(out, { recursive: true });

const WORLDS = ['dressing', 'order', 'linen', 'monograph'];

/* A finished plan, so home/budget/list have real content to lay out. */
const SEED = worldId => JSON.stringify({
  v: 4, worldId, unlocked: true, onboarded: true, seenLanding: true, revealSeen: true, obIx: 0,
  ans: { n1: 'Alex', n2: 'Sam', packId: 'greek-orthodox', variant: 'Greek / Cypriot',
         country: 'CY', home: 'GB', dateISO: '2027-09-18', guests: 250, guestsExact: 250,
         ceremony: 'Our own church', receptionMode: 'known', receptionOther: 'Ktima Oasis',
         priorities: ['Food & drink', 'Photography & film'], style: 'Glamorous' },
  plan: null, guests: [{ id: 'g1', name: 'Yiayia Maria', rsvp: 'yes' }, { id: 'g2', name: 'Kostas', rsvp: 'no' }],
  tables: [], runsheet: [], customTodos: [], photos: [], albumCode: null, cloud: null, _pushedAt: 0,
  budgetTotal: 38000, budgetEstimated: false, cur: 'EUR', tab: 'home', accOpen: {}, listFilter: 'all',
});

/* Same chromium-location dance as tests/run.mjs — the bundled browser binary
   is not a dependency, so fall back to the system one when it is present. */
const exe = process.env.PLAYWRIGHT_BROWSERS_PATH
  ? path.join(process.env.PLAYWRIGHT_BROWSERS_PATH, 'chromium')
  : null;
const browser = await chromium.launch(exe && fs.existsSync(exe) ? { executablePath: exe } : {});
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });

/* The gate first — world-blind by design, so it is shot once. */
await page.goto(`file://${dist}`);
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(out, '00-gate.png'), fullPage: true });
console.log('✓ 00-gate.png');

for (const w of WORLDS) {
  await page.goto(`file://${dist}`);
  await page.evaluate(s => { localStorage.clear(); localStorage.setItem('weddingapp', s); }, SEED(w));
  await page.reload();
  await page.waitForTimeout(600);

  const attr = await page.evaluate(() => document.documentElement.getAttribute('data-world'));
  if (attr !== w) { console.error(`✗ ${w}: data-world is "${attr}"`); process.exitCode = 1; }

  for (const tab of ['home', 'budget', 'list', 'guests']) {
    await page.evaluate(t => { S.tab = t; save(); render(); }, tab);
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(out, `${w}-${tab}.png`) });
  }

  /* A question screen too — it is where the progress metaphor lives, and where
     three of the four worlds differ most from each other. */
  await page.evaluate(() => { S.onboarded = false; S.revealSeen = false; S.obIx = 4; save(); render(); });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(out, `${w}-question.png`) });

  /* A sheet too — the sheet model is the highest-leverage thing varied, since
     all fourteen inherit it. */
  await page.evaluate(() => {
    // the question shot above left the app in onboarding, where #sheets does not exist
    S.onboarded = true; S.revealSeen = true; S.tab = 'home'; save(); render(); openTraditions();
  });
  await page.waitForTimeout(350);
  await page.screenshot({ path: path.join(out, `${w}-sheet.png`) });
  await page.evaluate(() => closeSheet());

  /* The paywall and partner sync. Bespoke since Phase 6b, and the two screens
     where a layout mistake costs money rather than polish. */
  await page.evaluate(() => { S.unlocked = false; save(); render(); openPaywall('Partner sync'); });
  await page.waitForTimeout(350);
  await page.screenshot({ path: path.join(out, `${w}-paywall.png`), fullPage: true });
  await page.evaluate(() => closeSheet());

  await page.evaluate(() => {
    S.unlocked = true;
    S.cloud = { id: 'demo', token: 'demo', pair: '55Z6UW', rev: 0 };
    save(); render(); openPartner();
  });
  await page.waitForTimeout(350);
  await page.screenshot({ path: path.join(out, `${w}-sync.png`), fullPage: true });
  await page.evaluate(() => { closeSheet(); S.cloud = null; save(); });

  console.log(`✓ ${w}: home · budget · list · guests · question · sheet · paywall · sync`);
}

await browser.close();
console.log(`\n${WORLDS.length * 8 + 1} shots → tests/shots/worlds/`);

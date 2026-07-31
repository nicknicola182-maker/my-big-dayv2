/* Golden files for the culture engine — 8 packs × 3 fixtures = 24 snapshots.
 *
 * These are the contract that says the engine still behaves. Generate them from a
 * known-good build, then never regenerate casually: a diff here means allocation,
 * timeline, paperwork or event selection changed, and that is either a bug or a
 * deliberate decision someone should be reviewing.
 *
 *   node tests/golden.mjs            verify (exits 1 on any drift)
 *   node tests/golden.mjs --write    regenerate
 */

import fs from 'node:fs';
import path from 'node:path';
import { createEngine, loadPacks, FIXTURES, buildFor, snapshot, goldenPath, ROOT } from './lib/engine.mjs';

const write = process.argv.includes('--write');
const engine = createEngine();
const packIds = Object.keys(loadPacks()).sort();

fs.mkdirSync(path.join(ROOT, 'tests', 'goldens'), { recursive: true });

let written = 0, matched = 0;
const drifted = [];

for (const packId of packIds) {
  for (const fixture of FIXTURES) {
    const snap = snapshot(buildFor(engine, packId, fixture));
    const file = goldenPath(packId, fixture.name);
    const json = JSON.stringify(snap, null, 2) + '\n';

    if (write) {
      fs.writeFileSync(file, json);
      written++;
      continue;
    }

    if (!fs.existsSync(file)) {
      drifted.push({ id: `${packId}/${fixture.name}`, why: 'no golden file — run: node tests/golden.mjs --write' });
      continue;
    }

    const expected = fs.readFileSync(file, 'utf8');
    if (expected === json) { matched++; continue; }

    // Report the first few concrete differences rather than "files differ".
    const before = JSON.parse(expected), after = snap;
    const diffs = [];
    const walk = (a, b, at) => {
      if (diffs.length >= 5) return;
      if (JSON.stringify(a) === JSON.stringify(b)) return;
      if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
        diffs.push(`${at}: ${JSON.stringify(a)} → ${JSON.stringify(b)}`);
        return;
      }
      if (Array.isArray(a) !== Array.isArray(b) || (Array.isArray(a) && a.length !== b.length)) {
        diffs.push(`${at}: ${Array.isArray(a) ? `${a.length} → ${b.length} entries` : 'shape changed'}`);
        return;
      }
      for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) walk(a[k], b[k], `${at}.${k}`);
    };
    walk(before, after, '');
    drifted.push({ id: `${packId}/${fixture.name}`, why: diffs.join('\n      ') || 'content differs' });
  }
}

if (write) {
  console.log(`golden: wrote ${written} snapshot${written === 1 ? '' : 's'} for ${packIds.length} packs`);
  process.exit(0);
}

for (const d of drifted) console.error(`  ✗ ${d.id}\n      ${d.why}`);
console.log(`golden: ${matched} matched, ${drifted.length} drifted (${packIds.length} packs × ${FIXTURES.length} fixtures)`);
process.exit(drifted.length ? 1 : 0);

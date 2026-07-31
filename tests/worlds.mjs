/* The four planner worlds.
 *
 * The expensive failure mode here is not a crash — it is a world that is
 * *almost* complete. One missing voice string and Ziggy silently speaks in
 * Anneke's register, or a token block omits a colour and a screen renders in
 * another world's palette. Both look like design decisions rather than bugs,
 * which is exactly why they need to be a CI failure instead of a review note. */

import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/engine.mjs';

const WORLDS = ['dressing', 'order', 'linen', 'monograph'];

export function run({ describe, ok, eq, group }) {
  const src = fs.readFileSync(path.join(ROOT, 'src', 'worlds.js'), 'utf8');
  const css = fs.readFileSync(path.join(ROOT, 'src', 'worlds.css'), 'utf8');
  const app1 = fs.readFileSync(path.join(ROOT, 'src', 'app1.js'), 'utf8');
  const app2 = fs.readFileSync(path.join(ROOT, 'src', 'app2.js'), 'utf8');

  /* worlds.js is plain script, not a module, so it is evaluated rather than
     imported — the same way the browser gets it. */
  const sandbox = {};
  const expose = ['PERSONAS', 'WORLD_IDS', 'WORLD_SHAPE', 'VOICE', 'TAB_LABELS',
    'say', 'tabLabel', 'ordinal', 'stepCount', 'personaOf', 'shape', 'worldId'];
  const fn = new Function('S', 'document', src + '\n;return {' + expose.map(k => `${k}:typeof ${k}!=="undefined"?${k}:undefined`).join(',') + '};');
  let W = fn(null, undefined);

  describe('worlds — the cast');
  eq(W.PERSONAS.length, 4, 'four planners');
  eq(W.WORLD_IDS.length, 4, 'four world ids');
  for (const id of WORLDS) {
    const p = W.personaOf(id);
    ok(!!p, `${id}: has a persona`);
    for (const k of ['name', 'first', 'title', 'initial', 'quote', 'pitch', 'signoff', 'worldName', 'worldLine', 'avatar']) {
      ok(!!(p[k] || '').trim() || k === 'endearment', `${id}: ${k} is written`);
    }
    ok(!!W.WORLD_SHAPE[id], `${id}: has a structural shape`);
  }
  // The four registers must stay distinct — if two share a signoff or a nav
  // model they have started to blur, which is the whole failure this cast exists
  // to avoid.
  const signoffs = W.PERSONAS.map(p => p.signoff);
  eq(new Set(signoffs).size, 4, 'four distinct signoffs');
  const navs = WORLDS.map(id => W.WORLD_SHAPE[id].nav);
  eq(new Set(navs).size, 4, 'four distinct navigation models', navs.join(' · '));
  const progs = WORLDS.map(id => W.WORLD_SHAPE[id].progress);
  eq(new Set(progs).size, 4, 'four distinct progress metaphors', progs.join(' · '));
  group('cast', '4 planners · 4 nav models · 4 progress metaphors');

  describe('worlds — every voice key is written in every world');
  {
    // This is the check that turns "did we write all the strings?" into a build
    // failure. A missing key would silently fall back to the house voice.
    let missing = 0, keys = 0;
    for (const [key, row] of Object.entries(W.VOICE)) {
      keys++;
      for (const w of WORLDS.concat(['house'])) {
        const val = row[w];
        // landingScript is deliberately empty for Anneke and Perdita — they
        // don't do handwritten asides.
        const mayBeEmpty = key === 'landingScript';
        if (val === undefined || (!mayBeEmpty && !String(val).trim())) {
          ok(false, `VOICE.${key} is written for ${w}`);
          missing++;
        }
      }
    }
    ok(missing === 0, 'no voice key falls back silently', `${keys} keys × 5 worlds`);
    for (const [key, row] of Object.entries(W.TAB_LABELS)) {
      for (const w of WORLDS.concat(['house'])) {
        ok(!!String(row[w] || '').trim(), `TAB_LABELS.${key} written for ${w}`);
      }
    }
    group('voice coverage', `${keys} voice keys + 6 tab labels, all four worlds`);
  }

  describe('worlds — a planner never speaks in another planner’s voice');
  {
    // Falling back across personas is worse than falling back to neutral: it
    // reads as a bug to the couple and it undoes the whole premise.
    const say = (key, w) => { const r = W.VOICE[key]; return r ? (r[w] ?? r.house) : ''; };
    for (const key of Object.keys(W.VOICE)) {
      const vals = WORLDS.map(w => say(key, w));
      const nonEmpty = vals.filter(x => String(x).trim());
      // Keys where all four say something must not be identical across all four
      // — that would mean the key never needed to be persona-varied.
      if (nonEmpty.length === 4) {
        ok(new Set(vals).size > 1, `VOICE.${key} actually varies by planner`);
      }
    }
    group('distinctness', 'every varied key differs across the cast');
  }

  describe('worlds — persona-transformed counting');
  {
    // These cost no extra strings: one call site, four renderings.
    eq(W.ordinal(6, 'roman'), 'VI', 'roman numerals');
    eq(W.ordinal(6, 'numero'), '№ 06', 'issue numbers are zero-padded');
    eq(W.ordinal(6, 'plain'), '6', 'plain counting');
    eq(W.ordinal(14, 'roman'), 'XIV', 'roman handles the teens');
  }

  describe('worlds — tokens exist for all four');
  {
    for (const w of WORLDS) {
      ok(css.includes(`[data-world="${w}"]`), `${w}: has a token block`);
      // Every world must set the tokens the shared components read, or a screen
      // inherits the previous world's colour.
      const block = css.split(`[data-world="${w}"]{`)[1]?.split('}')[0] || '';
      for (const tok of ['--paper', '--card', '--line', '--ink', '--muted', '--rose', '--grad']) {
        ok(block.includes(tok), `${w}: sets ${tok}`);
      }
    }
    // Anneke and Perdita are the proof the shared components survive extremes.
    const order = css.split('[data-world="order"]{')[1].split('}')[0];
    ok(/--w-radius:0px/.test(order), 'Anneke has zero radii');
    ok(/--w-shadow:none/.test(order), 'and zero shadow');
    const mono = css.split('[data-world="monograph"]{')[1].split('}')[0];
    ok(/--w-display-case:uppercase/.test(mono), 'Perdita’s display type is all caps');
    ok(/--w-hand:'Outfit'/.test(mono), 'and she never gets the script face');
    group('tokens', '4 token blocks, 7 shared tokens each');
  }

  describe('worlds — wiring');
  {
    ok(/function renderGate/.test(app1), 'the gate screen exists');
    ok(/if\(!S\.worldId\)\{ renderGate\(\); return; \}/.test(app1), 'and it comes before question one');
    ok(/function pickWorld/.test(app1), 'picking a planner is a state write');
    ok(/worldId:null/.test(app1), 'worldId is a declared state key, not an accretion');
    ok(/SCHEMA_V = 4/.test(app1), 'schema bumped for it');
    ok(/3: s =>/.test(app1), 'with a migration from v3');
    ok(/function swapPlanner/.test(app2), 'and the couple can swap later');
    ok(/applyWorld\(\)/.test(app2), 'the world is painted before first render');
    ok(/applyWorld\(t==="home"/.test(app2), 'and the surface follows the tab');
    // The dark home is Ziggy's alone and must be an attribute, not a JS branch.
    ok(css.includes('[data-world="dressing"][data-surface="home"]'), 'Ziggy’s dark home is CSS, not a JS dark-mode flag');
    group('wiring', 'gate → worldId → data-world → tokens');
  }

  describe('worlds — pack content is never persona-varied');
  {
    // Paperwork, customs, gotchas and timeline text are research, not voice.
    // Rewriting them per persona would be 1,376 rewrites and a factual-accuracy
    // disaster — jurisdiction-specific legal guidance in a jokey register.
    const voiceKeys = Object.keys(W.VOICE).join(' ');
    for (const forbidden of ['paperwork', 'gotcha', 'custom', 'timeline', 'legal']) {
      ok(!new RegExp(forbidden, 'i').test(voiceKeys), `no voice key touches ${forbidden} content`);
    }
    group('moat', 'the packs stay world-blind');
  }
}

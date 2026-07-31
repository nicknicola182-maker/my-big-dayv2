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
  const expose = ['PERSONAS', 'WORLD_IDS', 'WORLD_SHAPE', 'VOICE', 'TAB_LABELS', 'SHARED',
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

  describe('worlds — bespoke composition, not just colour');
  {
    /* The point of the worlds is that they are laid out differently, not tinted
       differently. These assert the structural promotions actually exist —
       without them a world could pass every token check above and still be the
       same screen in another palette. */
    ok(/function objectNav/.test(app2), 'Rosie’s table has objects as its navigation');
    ok(/shape\(\)\.nav==="objects" \? objectNav\(\)/.test(app2), 'and home routes through it');
    ok(css.includes('[data-world="linen"] .statgrid{display:none}'),
      'her stat grid gives way to them — two navigations would be one too many');
    ok(/\[data-world="linen"\] #tabbar button\{font-size/.test(css),
      'and her tab bar recedes rather than vanishing, so nobody is stranded');

    ok(/function composer\(\)/.test(app2), 'Ziggy’s world has a composer');
    ok(/function composerSend/.test(app2), 'that actually writes something');
    ok(/shape\(\)\.nav==="composer" && t==="home"/.test(app2), 'shown on his home only');
    ok(/touch\(row\)/.test(app2), 'and the row it writes is stamped, so it survives a sync');
    // It must use the same row shape as every other writer of customTodos.
    // The List view renders c.name; a `task` key showed a blank row.
    ok(/const row = \{id:uid\(\), name:text/.test(app2),
      'and uses the shape the List view actually renders');

    // The sheet model is the single highest-leverage thing varied — all
    // fourteen sheets inherit it from one function.
    ok(/const sig = persona\(\);/.test(app2), 'sheets are signed in the planner’s hand');
    ok(css.includes('[data-world="order"] .sheetwrap'), 'Anneke’s sheets are full-height pages');
    ok(/\[data-world="linen"\] \.sheet\{/.test(css), 'Rosie’s are cards set on the table');
    ok(/\[data-world="dressing"\] \.sheet\{/.test(css), 'Ziggy’s are gold-ruled');

    // Row models: a ledger has dotted leaders, a magazine has page references.
    ok(/border-bottom:1\.5px dotted/.test(css), 'Anneke’s rows carry a dotted leader');
    ok(/content:" — p\." counter\(entry\)/.test(css), 'Perdita’s entries carry a page reference');

    // Inline styles are the one thing a token cannot reach, so the two worlds
    // that must flatten them do it explicitly.
    ok(/background:transparent!important/.test(css),
      'the inline section tint is overridden where it would read wrong');
    group('composition', 'nav models · sheet models · row models');
  }

  describe('worlds — paywall & partner sync: framing varies, facts do not');
  {
    /* These two screens are now bespoke. That is only safe because the parts
       that must not vary are held in SHARED and asserted here. */
    ok(!!W.SHARED, 'the invariant block exists');
    eq(W.SHARED.PAY_FEATURES.length, 9, 'nine features, one list');

    // A per-world features list would be four things to keep in step with the
    // store listing, and any discrepancy is a review rejection.
    for (const key of ['PAY_FEATURES', 'PAY_TERMS', 'PAY_RESTORE', 'PAIR_BUTTON', 'PAIR_INSTRUCTION']) {
      ok(key in W.SHARED, `${key} is shared, not per-world`);
      ok(!(key in W.VOICE), `${key} has not grown a per-world variant`);
    }

    // The instruction names the button by its label. If either is varied
    // without the other, the couple is told to tap something that isn't there
    // — while standing next to each other trying to make it work.
    ok(W.SHARED.PAIR_INSTRUCTION.includes(W.SHARED.PAIR_BUTTON),
      'the pairing instruction names the button by its exact label',
      `"${W.SHARED.PAIR_BUTTON}"`);

    // The price is single-source in app1.js and must not be duplicated here.
    ok(/const PRICE_LABEL = /.test(app1), 'the price is declared once');
    ok(!/£\d/.test(src), 'and worlds.js never hardcodes a price');
    const payCalls = (app2.match(/PRICE_LABEL/g) || []).length;
    ok(payCalls >= 5, 'every price render interpolates it', `${payCalls} sites`);
    ok(/SHARED\.PAY_FEATURES\.map/.test(app2), 'the paywall renders the shared list');
    ok(/SHARED\.PAY_TERMS/.test(app2), 'and the shared terms');
    ok(/SHARED\.PAIR_INSTRUCTION/.test(app2), 'partner sync renders the shared instruction');
    ok(/SHARED\.PAIR_BUTTON/.test(app2), 'and labels the button from the same source');

    /* The terms say "No subscription". No world may contradict them.
       Perdita's headline was "THE SUBSCRIPTION" — sitting two lines above
       "One payment. No subscription. Yours forever." A store reviewer reads
       the purchase screen as one page, and so does the couple. */
    ok(/no subscription/i.test(W.SHARED.PAY_TERMS), 'the terms disclaim a subscription');
    for (const key of ['payTitle', 'payLead', 'payCta', 'payAck']) {
      for (const w of WORLDS.concat(['house'])) {
        const val = String(W.VOICE[key][w] || '');
        ok(!/subscri/i.test(val),
          `${key}/${w} does not contradict the terms by promising a subscription`, val);
        /* Affirmative claims only. "Nothing is removed from the free plan" and
           "No renewal" are consistent with the terms — they disclaim rather
           than promise, so a bare /free|renew/ would be wrong here. */
        ok(!/free trial|per month|per year|\/mo\b|a month|a year|auto-?renew|renews\b/i.test(val),
          `${key}/${w} promises no recurring billing the terms do not support`, val);
      }
    }

    // The framing, by contrast, must genuinely differ.
    for (const key of ['payTitle', 'payLead', 'payCta', 'syncTitle', 'syncLead']) {
      const vals = WORLDS.map(w => W.VOICE[key][w]);
      eq(new Set(vals).size, 4, `${key} is written four ways`);
    }
    // And the feature marker changes with the world: ticks, roman, issue numbers.
    const markers = WORLDS.map(w => W.WORLD_SHAPE[w].payMarker);
    ok(new Set(markers).size >= 3, 'the feature list is marked differently per world', markers.join(' · '));
    group('commerce', 'framing bespoke · price, features and pairing invariant');
  }

  describe('beta build — unlocked for testers, never for shipping');
  {
    /* The failure that matters here is not "the beta build is locked" — it is
       "the shipping build went out unlocked", which gives the app away and is
       invisible until revenue is zero. So the two builds are separate artifacts
       and the shipping one is asserted locked. */
    const build = fs.readFileSync(path.join(ROOT, 'build.py'), 'utf8');
    ok(/BETA = "--beta" in sys\.argv/.test(build), 'the beta build is opt-in via a flag');
    ok(/dist\/beta\/index\.html/.test(build), 'and writes to its own artifact');
    // If --beta could overwrite dist/index.html, one stray flag ships an
    // unlocked app. The write is in an else branch precisely to stop that.
    ok(/if BETA:[\s\S]*?dist\/beta\/index\.html[\s\S]*?else:[\s\S]*?dist\/index\.html/.test(build),
      'and can never overwrite the shipping build');
    ok(/BETA_UNLOCK = %s/.test(build), 'the flag reaches the page as a constant');

    ok(/function betaUnlocked/.test(app1), 'the app reads it through one helper');
    ok(/BETA_UNLOCK === true/.test(app1), 'strictly, so an undefined constant is locked');
    ok(/function applyBeta/.test(app1), 'and applies it on every load path');
    // A tester with an existing saved plan must be unlocked too, not just a
    // first-run arrival — otherwise the flag appears not to work.
    // Five exits: no save, unreadable save, newer-schema save, migrated save,
    // and the unrecoverable fallback. Miss one and the flag silently does
    // nothing for whichever tester happens to land on that path.
    const loadFn = app1.split('function load(){')[1].split('\n}')[0];
    eq((loadFn.match(/applyBeta\(\)/g) || []).length, 5, 'all five load exits apply it');
    ok(/Beta build/.test(app2), 'and the build says so on screen rather than pretending');

    const dist = path.join(ROOT, 'dist', 'index.html');
    if (fs.existsSync(dist)) {
      const built = fs.readFileSync(dist, 'utf8');
      ok(/const BETA_UNLOCK = false;/.test(built),
        'the committed dist/index.html is LOCKED', 'the shipping artifact must never be unlocked');
    }
    group('beta', 'separate artifact · shipping build asserted locked');
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

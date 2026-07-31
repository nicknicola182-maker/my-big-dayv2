/* ============ sync — merging two phones' copies of one plan ============ */
/* Loaded between app1 and app2. Pure functions only: no DOM, no fetch, no globals
 * beyond what's passed in, so it can be tested directly.
 *
 * The problem this solves: plan sync used to send the whole document and let the
 * newest write win. Add twelve guests at 9am; your partner, offline on the train,
 * ticks two tasks; their phone reconnects at 10am and its whole document is newer,
 * so your twelve guests are gone. No warning, no undo.
 *
 * The rule here: never lose a row. Rows are merged by id — anything either side
 * added survives, and where both sides edited the same row the more recent edit
 * wins on the strength of its `_m` stamp (set by touch() at each mutation site).
 * Only genuine scalar clashes (two different budget figures) need a human. */
'use strict';

/* Stamp a row as edited now. Called wherever the app mutates a synced row. */
function touch(o, now){ if(o && typeof o === "object") o._m = now || Date.now(); return o; }

/* Merge two arrays of {id} rows. Union by id; per-row, the later `_m` wins.
   A row with no stamp is treated as older than one with a stamp — an untouched
   row can't have been the more recent edit. */
function mergeRows(mine, theirs){
  const out = new Map();
  for(const r of (theirs||[])) if(r && r.id != null) out.set(r.id, r);
  for(const r of (mine||[])){
    if(!r || r.id == null) continue;
    const other = out.get(r.id);
    if(!other){ out.set(r.id, r); continue; }
    out.set(r.id, ((r._m||0) >= (other._m||0)) ? r : other);
  }
  // keep the incoming order, then anything only the remote had
  const order = [], seen = new Set();
  for(const r of (mine||[])) if(r && r.id != null && out.has(r.id) && !seen.has(r.id)){ order.push(out.get(r.id)); seen.add(r.id); }
  for(const r of (theirs||[])) if(r && r.id != null && !seen.has(r.id)){ order.push(out.get(r.id)); seen.add(r.id); }
  return order;
}

/* Scalars that are one shared decision rather than a list. If the two phones hold
   different values, the couple is asked — we do not silently pick. */
const SYNC_SCALARS = ["budgetTotal","cur","unlocked"];
const SCALAR_LABEL = {budgetTotal:"the budget", cur:"the currency", unlocked:"the unlock"};

/* Merge a remote plan document into the local one.
   Returns {state, clashes:[{key,mine,theirs,label}]}. Never mutates its inputs. */
function mergeState(mine, theirs){
  if(!theirs) return {state: mine, clashes: []};
  if(!mine)   return {state: theirs, clashes: []};

  const merged = Object.assign({}, theirs, mine);   // start from local, remote fills gaps

  merged.guests      = mergeRows(mine.guests, theirs.guests);
  merged.customTodos = mergeRows(mine.customTodos, theirs.customTodos);
  merged.tables      = mergeRows(mine.tables, theirs.tables);

  if(mine.plan && theirs.plan){
    merged.plan = Object.assign({}, mine.plan);
    merged.plan.items     = mergeRows(mine.plan.items, theirs.plan.items);
    merged.plan.timeline  = mergeRows(mine.plan.timeline, theirs.plan.timeline);
    merged.plan.paperwork = mergeRows(mine.plan.paperwork, theirs.plan.paperwork);
  } else {
    merged.plan = mine.plan || theirs.plan;
  }

  const clashes = [];
  for(const k of SYNC_SCALARS){
    const a = mine[k], b = theirs[k];
    if(a === undefined || b === undefined || a === b) continue;
    if(k === "unlocked"){ merged[k] = !!(a || b); continue; }   // paid once, on both phones
    merged[k] = a;                                             // hold local until they choose
    clashes.push({key:k, mine:a, theirs:b, label: SCALAR_LABEL[k] || k});
  }

  // never let a merge resurrect deleted photos or hand over the wrong credentials
  merged.photos = mine.photos || [];
  merged.cloud  = mine.cloud  || theirs.cloud;
  return {state: merged, clashes};
}

if(typeof module !== "undefined" && module.exports){
  module.exports = {touch, mergeRows, mergeState, SYNC_SCALARS};
}

/* The four planner worlds.
 *
 * Picking a planner swaps the whole design world — palette, type, card model,
 * navigation, progress metaphor and voice. It is not a theme toggle.
 *
 * Split of responsibility, and it matters:
 *   worlds.css  owns everything visual, under [data-world=…] selectors. Swapping
 *               planner is one attribute write on <html>; no re-render, no FOUC.
 *   worlds.js   (this file) owns only the facts JS actually needs — who the
 *               planner is, which nav and progress model their world uses, and
 *               what they say.
 *
 * Load order: before app1.js, because renderGate/renderLanding/renderOB call say(). */

const WORLD_IDS = ["dressing", "order", "linen", "monograph"];

const PERSONAS = [
  {
    id: "dressing",
    name: "Ziggy Adeyemi", first: "Ziggy", title: "THE BEST FRIEND", initial: "Z",
    quote: "phone down, babe. we're doing this properly.",
    pitch: "Loud, tactile, entirely on your side — and secretly the most organised person in your life.",
    endearment: "babe", signoff: "— Z x",
    worldName: "The Dressing Room", worldLine: "velvet, mirror bulbs, gold foil",
    avatar: "linear-gradient(135deg,#E0559C,#B62D77)", avatarInk: "#FDEBF4",
  },
  {
    id: "order",
    name: "Anneke Vos", first: "Anneke", title: "THE STILL POINT", initial: "A",
    quote: "breathe. nothing here is urgent yet.",
    pitch: "Unhurried and exact. Never raises her voice, never uses an endearment — she uses your names.",
    endearment: "", signoff: "A.V.",
    worldName: "The Order Book", worldLine: "an atelier ledger — ruled lines, numbered entries",
    avatar: "#33404F", avatarInk: "#DCE6EE",
  },
  {
    id: "linen",
    name: "Rosalba “Rosie” Marchetti", first: "Rosie", title: "THE MOTHER", initial: "R",
    quote: "you've not eaten. sit — we'll do the list after.",
    pitch: "Loves you to the point of nuisance. Has already phoned the venue. Has Opinions about your aunt.",
    endearment: "sweetheart", signoff: "— love, Rosie x",
    worldName: "The Linen Table", worldLine: "the plan as objects on a laid table",
    avatar: "#A66A3C", avatarInk: "#FBEFD9",
  },
  {
    id: "monograph",
    name: "Perdita Vane", first: "Perdita", title: "THE FASHION DIRECTOR", initial: "P",
    quote: "it's fine. it's fine. — no it isn't, we're changing it.",
    pitch: "Decadently stylish, permanently unimpressed, and quietly ruthless on your behalf.",
    endearment: "sweetie", signoff: "— P.V.",
    worldName: "The Monograph", worldLine: "the wedding planned like a magazine issue",
    avatar: "#3E2F52", avatarInk: "#E4DAF0",
  },
];

/* Structural signatures. Purely the facts a render function has to branch on —
   anything expressible in CSS lives in worlds.css instead. */
const WORLD_SHAPE = {
  dressing:  { nav: "composer",  progress: "bulbs",    ordinal: "plain", darkHome: true  },
  order:     { nav: "tabs-text", progress: "roman",    ordinal: "roman", darkHome: false },
  linen:     { nav: "objects",   progress: "stitches", ordinal: "plain", darkHome: false },
  monograph: { nav: "tabs-rule", progress: "numero",   ordinal: "numero", darkHome: false },
  house:     { nav: "tabs-icon", progress: "bar",      ordinal: "plain", darkHome: false },
};

function personaOf(id) { return PERSONAS.find(p => p.id === id) || null; }
function worldId() { return (typeof S !== "undefined" && S && S.worldId) || "house"; }
function persona() { return personaOf(worldId()); }
function shape() { return WORLD_SHAPE[worldId()] || WORLD_SHAPE.house; }

/* One attribute write re-skins the entire app. Called on boot and on swap.
   `surface` exists because Ziggy alone has two grounds — a pale question screen
   and a dark home. Modelling it as an attribute rather than a JS dark-mode flag
   keeps it free and stops it leaking a branch into every later surface. */
function applyWorld(surface) {
  const el = document.documentElement;
  if (!el) return;
  el.setAttribute("data-world", worldId());
  if (surface) el.setAttribute("data-surface", surface);
}

/* ---------- voice ----------
 * A string is persona-varied only where the persona's whole point is that they
 * would say it differently, AND the couple sees it more than once.
 *
 * Never varied, deliberately: anything legal, financial, factual or safety
 * critical. All pack content — paperwork, customs, gotchas, timeline — is
 * research, not voice, and stays exactly as written.  */

const v = (dressing, order, linen, monograph, house) =>
  ({ dressing, order, linen, monograph, house });

const VOICE = {
  landingKicker: v("right then", "before we begin", "come in, come in", "THE CONSULTATION", "My Big Day"),
  landingScript: v("darling…", "", "sit down, love…", "", "darling…"),
  landingTitle: v(
    "Somebody's getting<br>married.",
    "Let us begin at<br>the beginning.",
    "Oh, look at<br>the pair of you.",
    "A WEDDING<br>IS AN ISSUE.",
    "You're getting<br>married."),
  landingBody: v(
    "Sit down, put the phone face-down and tell me everything. A handful of questions and I'll build the whole thing round the two of you.",
    "A few questions, in order, no rush. Each answer decides something real — the prices, the paperwork, the dates you cannot use.",
    "Kettle's on. I'll ask a few bits and bobs, you answer however you like, and I'll worry about the rest of it.",
    "Answer well and the plan writes itself. Every question decides prices, paperwork or light.",
    "A few little questions, and I'll build the whole thing around you two."),
  landingCta: v("Let's do this", "Begin", "Come on then", "BEGIN", "Let's begin"),

  next: v("Next, gorgeous", "Continue", "Onwards, sweetheart", "NEXT", "Next"),
  build: v("Build it, babe", "Draw up the plan", "Let's see it then", "GO TO PRESS", "Build my plan"),
  skip: v("not tonight", "leave blank", "skip it, love", "SKIP", "skip"),
  back: v("back", "back", "back a bit", "BACK", "back"),

  revealKicker: v("babe.", "Your plan.", "oh, my darlings…", "THE ISSUE", "darlings…"),
  revealBody: v(
    "Look at it. Your traditions, your country, your numbers — and I've barely started.",
    "Drawn from your answers only. Every figure is a starting point and every one is yours to overrule.",
    "There now. That's your day taking shape — and I'll be here for all of it.",
    "Assembled from your answers. Argue with the numbers; they are a first draft, not a verdict.",
    "Your traditions, your country, your numbers. Every figure is a starting point."),
  revealCta: v("Show me everything", "Open the book", "Show me, then", "OPEN THE ISSUE", "Show me my wedding"),

  budgetTitle: v("The whole beautiful bill", "Accounts", "The purse", "THE BUDGET, EDITED", "Budget"),
  guestsTitle: v("Who's coming", "The guest list", "Who we're feeding", "CIRCULATION", "Guests"),
  listTitle:   v("The whole timeline", "The order of works", "What's left to do", "THE SCHEDULE", "List"),
  albumTitle:  v("The album", "The album", "Everyone's photos", "THE COVER SHOOT", "Album"),
  moreTitle:   v("Everything else", "Everything else", "Bits and bobs", "THE DESK", "More"),
  homeTitle:   v("Tonight's business", "The plan", "The table", "THE ISSUE", "Home"),
  /* Ziggy's composer is the only world whose nav model writes data, so it is
     the only one that needs an acknowledgement. The others inherit house. */
  composerAck: v("noted, babe.", "Noted.", "got it, love.", "NOTED.", "Added to your list"),
};

/* Tab labels are their own table, not the long titles above — a tab bar has
   room for one word. Anneke and Perdita drop the icons entirely (see
   worlds.css), so for them the word is doing all the work. */
const TAB_LABELS = {
  home:   v("Tonight", "Plan",     "Table",  "ISSUE",  "Home"),
  budget: v("The bill", "Accounts", "Purse",  "BUDGET", "Budget"),
  guests: v("Coming",  "Guests",   "Feeding", "CIRC.",  "Guests"),
  list:   v("To do",   "Works",    "Jobs",   "SCHEDULE", "List"),
  album:  v("Album",   "Album",    "Photos", "SHOOT",  "Album"),
  more:   v("Else",    "Else",     "Bits",   "DESK",   "More"),
};
function tabLabel(k) {
  const row = TAB_LABELS[k];
  return row ? (row[worldId()] ?? row.house) : k;
}

/* Falls back to the neutral house voice, never to another planner's — an
   Anneke line surfacing in Ziggy's world reads as a bug, not a variation. */
function say(key) {
  const row = VOICE[key];
  if (!row) return "";
  return row[worldId()] ?? row.house ?? "";
}

/* ---------- persona-transformed, not rewritten ----------
   These cost no extra strings: one call site, four renderings. */

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
  "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX"];

function ordinal(n, fmt) {
  const f = fmt || shape().ordinal;
  if (f === "roman") return ROMAN[n] || String(n);
  if (f === "numero") return "№ " + String(n).padStart(2, "0");
  return String(n);
}

/* "6 of 17" in each world's own counting. */
function stepCount(i, total) {
  const p = shape().progress;
  if (p === "roman") return ordinal(i, "roman") + " / " + ordinal(total, "roman");
  if (p === "numero") return ordinal(i, "numero") + " / " + total;
  if (p === "stitches") return "STITCH " + i + " OF " + total;
  return i + " of " + total;
}

/* Signs a line in the planner's hand. Shared copy stays unsigned. */
function sign(text) {
  const p = persona();
  return p && p.signoff ? text + " " + p.signoff : text;
}

/* The one word that identifies whose world you are in. Empty for Anneke by
   design — she uses the couple's actual names, which from her reads as respect. */
function endear(fallback) {
  const p = persona();
  if (!p) return fallback || "";
  return p.endearment || fallback || "";
}

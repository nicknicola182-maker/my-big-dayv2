/* The four planners. Picking one swaps the whole design world — palette, type,
   card model, navigation, progress metaphor and voice. Not a theme toggle. */

export type WorldId = 'dressing' | 'order' | 'linen' | 'monograph';

export interface Persona {
  id: WorldId;
  name: string;
  first: string;
  title: string;
  initial: string;
  quote: string;
  pitch: string;
  endearment: string;      // one word that identifies whose world you're in
  signoff: string;
  worldName: string;
  worldLine: string;
  avatar: string;          // css background
  avatarInk: string;
}

export const PERSONAS: Persona[] = [
  {
    id: 'dressing',
    name: 'Ziggy Adeyemi', first: 'Ziggy', title: 'THE BEST FRIEND', initial: 'Z',
    quote: 'phone down, babe. we’re doing this properly.',
    pitch: 'Loud, tactile, entirely on your side — and secretly the most organised person in your life.',
    endearment: 'babe', signoff: '— Z x',
    worldName: 'The Dressing Room', worldLine: 'velvet, mirror bulbs, gold foil',
    avatar: 'linear-gradient(135deg,#E0559C,#B62D77)', avatarInk: '#FDEBF4',
  },
  {
    id: 'order',
    name: 'Anneke Vos', first: 'Anneke', title: 'THE STILL POINT', initial: 'A',
    quote: 'breathe. nothing here is urgent yet.',
    pitch: 'Unhurried and exact. Never raises her voice, never uses an endearment — she uses your names.',
    endearment: '', signoff: 'A.V.',
    worldName: 'The Order Book', worldLine: 'an atelier ledger — ruled lines, numbered entries',
    avatar: '#33404F', avatarInk: '#DCE6EE',
  },
  {
    id: 'linen',
    name: 'Rosalba “Rosie” Marchetti', first: 'Rosie', title: 'THE MOTHER', initial: 'R',
    quote: 'you’ve not eaten. sit — we’ll do the list after.',
    pitch: 'Loves you to the point of nuisance. Has already phoned the venue. Has Opinions about your aunt.',
    endearment: 'sweetheart', signoff: '— love, Rosie x',
    worldName: 'The Linen Table', worldLine: 'the plan as objects on a laid table',
    avatar: '#A66A3C', avatarInk: '#FBEFD9',
  },
  {
    id: 'monograph',
    name: 'Perdita Vane', first: 'Perdita', title: 'THE FASHION DIRECTOR', initial: 'P',
    quote: 'it’s fine. it’s fine. — no it isn’t, we’re changing it.',
    pitch: 'Decadently stylish, permanently unimpressed, and quietly ruthless on your behalf.',
    endearment: 'sweetie', signoff: '— P.V.',
    worldName: 'The Monograph', worldLine: 'the wedding planned like a magazine issue',
    avatar: '#3E2F52', avatarInk: '#E4DAF0',
  },
];

export const byId = (id: WorldId) => PERSONAS.find(p => p.id === id)!;

/* ── design tokens per world ───────────────────────────────────────────── */

export interface World {
  canvas: string;          // question-screen ground
  canvasHome: string;      // home ground (Ziggy alone differs)
  surface: string;
  ink: string; ink2: string; ink3: string;
  inkHome: string; ink2Home: string;
  rule: string;
  accent: string; accentInk: string; accentGrad: string;
  metal: string;
  radius: string; radiusSm: string;
  shadow: string;
  edge: string;
  gutter: string;
  display: string;         // font-family for display type
  displayCase: 'none' | 'uppercase';
  displayTrack: string;
  hand: string;            // "handwriting" family
  handCase: 'none' | 'uppercase';
  handTrack: string;
  btnTrack: string;
  btnRadius: string;
  rotate: number;          // Rosie tilts everything
  nav: 'composer' | 'tabs-text' | 'objects' | 'tabs-rule';
  progress: 'bulbs' | 'roman' | 'stitches' | 'numero';
  texture: string;         // background-image for the canvas
  darkHome: boolean;
}

export const WORLDS: Record<WorldId, World> = {
  dressing: {
    canvas: 'linear-gradient(175deg,#FFF8F1 0%,#FDF0F5 55%,#FAE6EF 100%)',
    canvasHome: 'radial-gradient(130% 90% at 50% 0%,#4A1240 0%,#320C2E 55%,#1F0720 100%)',
    surface: '#FFFDFA', ink: '#33262B', ink2: '#5C4650', ink3: '#9A7F8F',
    inkHome: '#FBEDF4', ink2Home: '#D9A8C6',
    rule: '#F6E9E0',
    accent: '#B62D77', accentInk: '#fff', accentGrad: 'linear-gradient(135deg,#E0559C,#B62D77)',
    metal: '#E8BE6E',
    radius: '20px', radiusSm: '15px',
    shadow: '0 14px 34px rgba(120,35,90,.14), 0 0 0 1.5px rgba(232,190,110,.5)',
    edge: 'none', gutter: '22px',
    display: "'Gloock', Georgia, serif", displayCase: 'none', displayTrack: '0',
    hand: "'Script', cursive", handCase: 'none', handTrack: '0',
    btnTrack: '.02em', btnRadius: '18px', rotate: 0,
    nav: 'composer', progress: 'bulbs', texture: 'none', darkHome: true,
  },
  order: {
    canvas: '#FBF7F0', canvasHome: '#FBF7F0',
    surface: '#FBF7F0', ink: '#2B2025', ink2: '#5C4650', ink3: '#A08792',
    inkHome: '#2B2025', ink2Home: '#A08792',
    rule: '#E4D9C8',
    accent: '#C9587A', accentInk: '#fff', accentGrad: '#C9587A',
    metal: '#C29A5B',
    radius: '0px', radiusSm: '0px',
    shadow: 'none', edge: '1px solid #E4D9C8', gutter: '30px',
    display: "'Gloock', Georgia, serif", displayCase: 'none', displayTrack: '-.01em',
    hand: "'Script', cursive", handCase: 'none', handTrack: '0',
    btnTrack: '.26em', btnRadius: '0px', rotate: 0,
    nav: 'tabs-text', progress: 'roman', texture: 'none', darkHome: false,
  },
  linen: {
    canvas: '#F6EDE0', canvasHome: '#F6EDE0',
    surface: '#FFFDF9', ink: '#33262B', ink2: '#5C4650', ink3: '#A08792',
    inkHome: '#33262B', ink2Home: '#A08792',
    rule: '#EFE4D2',
    accent: '#C9587A', accentInk: '#fff', accentGrad: '#C9587A',
    metal: '#BFA07F',
    radius: '14px', radiusSm: '10px',
    shadow: '0 10px 26px rgba(60,40,30,.14)',
    edge: '1px solid #EFE4D2', gutter: '26px',
    display: "'Gloock', Georgia, serif", displayCase: 'none', displayTrack: '0',
    hand: "'Script', cursive", handCase: 'none', handTrack: '0',
    btnTrack: '.1em', btnRadius: '8px', rotate: 2,
    nav: 'objects', progress: 'stitches',
    texture: 'repeating-linear-gradient(90deg,#F6EDE0,#F6EDE0 14px,#F2E7D7 14px,#F2E7D7 15px)',
    darkHome: false,
  },
  monograph: {
    canvas: '#FAF8F3', canvasHome: '#FAF8F3',
    surface: '#FAF8F3', ink: '#17141A', ink2: '#6E6660', ink3: '#8A8087',
    inkHome: '#17141A', ink2Home: '#8A8087',
    rule: '#E4DED2',
    accent: '#7A1F2B', accentInk: '#FAF8F3', accentGrad: '#17141A',
    metal: '#B8B0A4',
    radius: '0px', radiusSm: '0px',
    shadow: 'none', edge: '1px solid #E4DED2', gutter: '28px',
    display: "'Gloock', Georgia, serif", displayCase: 'uppercase', displayTrack: '-.01em',
    /* Perdita never gets handwriting — her asides are withering small caps. */
    hand: "'Outfit', system-ui, sans-serif", handCase: 'uppercase', handTrack: '.24em',
    btnTrack: '.24em', btnRadius: '0px', rotate: 0,
    nav: 'tabs-rule', progress: 'numero', texture: 'none', darkHome: false,
  },
};

/* ── voice ─────────────────────────────────────────────────────────────── */
/* Only strings whose whole point is that this person would say them differently.
   Anything legal, factual or financial stays shared — it comes from the packs. */

type V = Record<WorldId, string>;
const v = (dressing: string, order: string, linen: string, monograph: string): V =>
  ({ dressing, order, linen, monograph });

export const VOICE = {
  landingKicker: v('right then', 'before we begin', 'come in, come in', 'THE CONSULTATION'),
  landingTitle: v(
    'Somebody’s getting\nmarried.',
    'Let us begin at\nthe beginning.',
    'Oh, look at\nthe pair of you.',
    'A WEDDING\nIS AN ISSUE.'),
  landingBody: v(
    'Sit down, put the phone face-down and tell me everything. Fourteen-ish questions and I’ll build the whole thing round the two of you.',
    'A few questions, in order, no rush. Each answer decides something real — the prices, the paperwork, the dates you cannot use.',
    'Kettle’s on. I’ll ask a few bits and bobs, you answer however you like, and I’ll worry about the rest of it.',
    'Answer well and the plan writes itself. Every question below decides prices, paperwork or light.'),
  landingCta: v('Let’s do this', 'Begin', 'Come on then', 'BEGIN'),
  next: v('Next, gorgeous', 'Continue', 'Onwards, sweetheart', 'NEXT'),
  build: v('Build it, babe', 'Draw up the plan', 'Let’s see it then', 'GO TO PRESS'),
  skip: v('not tonight', 'leave blank', 'skip it, love', 'SKIP'),
  back: v('back', 'back', 'back a bit', 'BACK'),
  revealKicker: v('babe.', 'Your plan.', 'oh, my darlings…', 'THE ISSUE'),
  revealBody: v(
    'Look at it. Your traditions, your country, your numbers — and I’ve barely started.',
    'Drawn from your answers only. Every figure is a starting point and every one is yours to overrule.',
    'There now. That’s your day taking shape — and I’ll be here for all of it.',
    'Assembled from your answers. Argue with the numbers; they are a first draft, not a verdict.'),
  revealCta: v('Show me everything', 'Open the book', 'Show me, then', 'OPEN THE ISSUE'),
  todayLabel: v('ONE THING TODAY', 'TODAY', 'today, sweetheart', 'THE BRIEF OF THE DAY'),
  todayDone: v('Done, babe', 'Tick it off', 'All done, love', 'FILED'),
  todaySnooze: v('tomorrow', 'not today', 'in a bit', 'HOLD'),
  customLabel: v('BACKSTAGE INTEL', 'MARGIN NOTES', 'a little something', 'OBJECT OF THE DAY'),
  another: v('another', 'another', 'go on then', 'NEXT'),
  budgetTitle: v('The whole beautiful bill', 'Accounts', 'The purse', 'THE BUDGET, EDITED'),
  guestsTitle: v('Who’s coming', 'The guest list', 'Who we’re feeding', 'CIRCULATION'),
  listTitle: v('The whole timeline', 'The order of works', 'What’s left to do', 'THE SCHEDULE'),
  albumTitle: v('The album', 'The album', 'Everyone’s photos', 'THE COVER SHOOT'),
  moreTitle: v('Everything else', 'Everything else', 'Bits and bobs', 'THE DESK'),
} as const;

export const say = (key: keyof typeof VOICE, w: WorldId) => VOICE[key][w];

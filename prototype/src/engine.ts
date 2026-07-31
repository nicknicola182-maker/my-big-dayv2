/* The culture engine — the part that makes this app worth existing.
   Ported from the production app1.js: same shares, same country multipliers,
   same allocation and the same backwards-dated timeline. */

import { PACKS } from '@/data/packs';

export type PackId = keyof typeof PACKS;

/* [code, name, currency, cost multiplier vs UK, currency units per GBP] */
export const COUNTRIES: [string, string, string, number, number][] = [
  ['AU', 'Australia', 'AUD', 1.1, 1.95], ['CA', 'Canada', 'CAD', 1.05, 1.75],
  ['CY', 'Cyprus', 'EUR', 0.72, 1.15], ['FR', 'France', 'EUR', 0.9, 1.15],
  ['DE', 'Germany', 'EUR', 0.85, 1.15], ['GR', 'Greece', 'EUR', 0.68, 1.15],
  ['IN', 'India', 'INR', 0.35, 110], ['IE', 'Ireland', 'EUR', 1.05, 1.15],
  ['IL', 'Israel', 'ILS', 1.0, 4.6], ['IT', 'Italy', 'EUR', 0.85, 1.15],
  ['NL', 'Netherlands', 'EUR', 0.9, 1.15], ['PT', 'Portugal', 'EUR', 0.7, 1.15],
  ['ES', 'Spain', 'EUR', 0.75, 1.15], ['AE', 'United Arab Emirates', 'AED', 1.15, 4.7],
  ['GB', 'United Kingdom', 'GBP', 1.0, 1], ['US', 'United States', 'USD', 1.25, 1.25],
];

const CURSYM: Record<string, string> = {
  GBP: '£', EUR: '€', USD: '$', CAD: 'C$', AUD: 'A$', INR: '₹', ILS: '₪', AED: 'AED ',
};
const BASE_MEDIAN_GBP = 24000;

export const PRIORITIES = ['Food & drink', 'Photography & film', 'Music & dancing',
  'Flowers & styling', 'Attire', 'The venue', 'Beauty', 'Transport'];
const PRIO_SECTION: Record<string, string> = {
  'Food & drink': 'Reception', 'Photography & film': 'Photos & Film',
  'Music & dancing': 'Music & Entertainment', 'Flowers & styling': 'Flowers & Styling',
  'Attire': 'Attire', 'The venue': 'Reception', 'Beauty': 'Beauty', 'Transport': 'Transport',
};

export const countryOf = (code: string) => COUNTRIES.find(c => c[0] === code) || COUNTRIES[14];
export const symbolFor = (cur: string) => CURSYM[cur] || '£';
export const money = (n: number, cur: string) =>
  n == null || isNaN(n) ? '—' : symbolFor(cur) + Math.round(n).toLocaleString('en-GB');
const niceRound = (n: number) => {
  const m = Math.pow(10, Math.max(0, Math.floor(Math.log10(n)) - 1));
  return Math.round(n / m) * m;
};
export const kfmt = (n: number, cur: string) => {
  const s = symbolFor(cur);
  return n >= 1000 ? s + (n / 1000).toLocaleString('en-GB', { maximumFractionDigits: 1 }) + 'k' : s + n;
};

export interface Answers {
  n1: string; n2: string;
  packId: PackId | null;
  country: string;
  dateISO: string;
  guests: number | null;
  budget: number | null;
  budgetEstimated: boolean;
  priorities: string[];
  eventsOn: string[] | null;
  style: string;
}

export const blankAnswers = (): Answers => ({
  n1: '', n2: '', packId: null, country: 'GB', dateISO: '', guests: null,
  budget: null, budgetEstimated: false, priorities: [], eventsOn: null, style: '',
});

export interface PlanItem {
  id: string; name: string; section: string; note: string;
  essential: boolean; religious: boolean; supplier: string;
  share: number; on: boolean; alloc: number; agreed: number | null; paid: number;
}
export interface PlanTask { id: string; task: string; mb: number; critical: boolean; when: string; done: boolean }
export interface PlanPaper { id: string; item: string; who: string; note: string; done: boolean }
export interface Plan {
  events: { id: string; name: string; when: string; description: string }[];
  items: PlanItem[];
  timeline: PlanTask[];
  paperwork: PlanPaper[];
}

const addMonths = (d: Date, m: number) => { const x = new Date(d); x.setMonth(x.getMonth() + m); return x; };
const monthLabel = (d: Date) => d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });

export function guestBands() {
  return [
    { label: 'Up to 75', mid: 50, note: 'every face known' },
    { label: '76 – 150', mid: 110, note: 'the classic' },
    { label: '151 – 300', mid: 220, note: 'a proper crowd' },
    { label: '300 or more', mid: 400, note: 'the whole village' },
  ];
}

export function budgetBands(country: string) {
  const cc = countryOf(country), cur = cc[2], fx = cc[4] || 1;
  const B = [10000, 20000, 30000, 40000, 50000].map(n => niceRound(n * fx));
  const mid = (a: number, b: number) => niceRound((a + b) / 2);
  return {
    cur,
    bands: [
      { label: 'Under ' + kfmt(B[0], cur), mid: niceRound(B[0] * 0.8) },
      { label: kfmt(B[0], cur) + ' – ' + kfmt(B[1], cur), mid: mid(B[0], B[1]) },
      { label: kfmt(B[1], cur) + ' – ' + kfmt(B[2], cur), mid: mid(B[1], B[2]) },
      { label: kfmt(B[2], cur) + ' – ' + kfmt(B[3], cur), mid: mid(B[2], B[3]) },
      { label: kfmt(B[3], cur) + ' – ' + kfmt(B[4], cur), mid: mid(B[3], B[4]) },
      { label: kfmt(B[4], cur) + '+', mid: niceRound(B[4] * 1.3) },
    ],
  };
}

export function estimateBudget(a: Answers) {
  const cc = countryOf(a.country);
  const p = a.packId ? PACKS[a.packId] : null;
  const typ = p ? p.typicalGuests.typical : 120;
  const scale = Math.min(2.2, Math.max(0.6, (a.guests || typ) / typ));
  return niceRound(BASE_MEDIAN_GBP * cc[3] * (cc[4] || 1) * scale);
}

export function buildPlan(a: Answers): Plan {
  const p = PACKS[a.packId as PackId];
  const enabled = new Set(a.eventsOn || p.events.filter(e => e.default !== false).map(e => e.id));
  const events = p.events.filter(e => enabled.has(e.id))
    .map(e => ({ id: e.id, name: e.name, when: e.when, description: e.description }));

  const items: PlanItem[] = p.items
    .filter(i => !i.event || enabled.has(i.event))
    .map(i => ({
      id: i.id, name: i.name, section: i.section, note: i.note,
      essential: i.essential, religious: i.religious, supplier: i.supplier,
      share: i.share, on: i.essential, alloc: 0, agreed: null, paid: 0,
    }));
  allocate(items, a);

  const wd = a.dateISO ? new Date(a.dateISO) : null;
  const timeline: PlanTask[] = p.timeline.map((t, ix) => ({
    id: 't' + ix, task: t.task, mb: t.mb, critical: t.critical, done: false,
    when: wd ? monthLabel(addMonths(wd, -t.mb)) : t.mb + ' months before',
  })).sort((x, y) => y.mb - x.mb);

  const paperwork: PlanPaper[] = p.paperwork.map((pp, ix) => ({
    id: 'p' + ix, item: pp.item, who: pp.who, note: pp.note, done: false,
  }));

  return { events, items, timeline, paperwork };
}

/* Weighted shares: a chosen priority boosts its section by 1.22, everything else
   gets 0.96, then the whole thing is normalised onto the couple's real budget. */
export function allocate(items: PlanItem[], a: Answers) {
  const total = a.budget || 0;
  const boost: Record<string, number> = {};
  (a.priorities || []).forEach(pr => { boost[PRIO_SECTION[pr]] = 1.22; });
  let sum = 0;
  const w = new Map<string, number>();
  items.forEach(i => { if (i.on) { const x = i.share * (boost[i.section] || 0.96); w.set(i.id, x); sum += x; } });
  items.forEach(i => { i.alloc = i.on && sum > 0 && total > 0 ? Math.round((w.get(i.id) || 0) / sum * total) : 0; });
}

export const sectionTotals = (items: PlanItem[]) => {
  const m = new Map<string, number>();
  items.filter(i => i.on).forEach(i => m.set(i.section, (m.get(i.section) || 0) + i.alloc));
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
};

export const daysToGo = (iso: string) =>
  iso ? Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000)) : null;

export const dateShort = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Date to be chosen';

export const dateInWords = (iso: string) => {
  if (!iso) return 'A date still to be chosen';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

export const ordinal = (n: number, style: 'bulbs' | 'roman' | 'stitches' | 'numero') => {
  const R = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI'];
  if (style === 'roman') return R[n] || String(n);
  if (style === 'numero') return '№ ' + String(n).padStart(2, '0');
  return String(n);
};

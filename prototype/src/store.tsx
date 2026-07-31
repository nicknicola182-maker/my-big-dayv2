import React from 'react';
import {
  blankAnswers, buildPlan, allocate, estimateBudget,
  type Answers, type Plan, type PlanItem,
} from '@/engine';
import type { WorldId } from '@/world/personas';

export interface Guest {
  id: string; name: string; side: 0 | 1 | 2; rsvp: 'yes' | 'no' | 'pending';
  diet: string; plus: number;
}
export interface Quote { id: string; supplier: string; amt: number; note: string; chosen: boolean }
export interface Table { id: string; name: string; seats: number; g: string[] }
export interface Todo { id: string; name: string; who: string; done: boolean }
export interface Photo { id: string; src: string; caption: string }

export const FREE_CUSTOM_CAP = 10;
export const FREE_TABLE_CAP = 2;
export const PRICE = '£6.99';

export interface State {
  screen: 'gate' | 'landing' | 'q' | 'reveal' | 'app';
  world: WorldId;
  qi: number;
  a: Answers;
  plan: Plan | null;
  guests: Guest[];
  tables: Table[];
  todos: Todo[];
  photos: Photo[];
  quotes: Record<string, Quote[]>;
  unlocked: boolean;
  tab: string;
  albumCode: string;
}

const uid = () => Math.random().toString(36).slice(2, 9);
const KEY = 'mybigday.proto.v1';

export const blankState = (): State => ({
  screen: 'gate', world: 'dressing', qi: 0, a: blankAnswers(), plan: null,
  guests: [], tables: [], todos: [], photos: [], quotes: {},
  unlocked: false, tab: 'home', albumCode: 'K7F2QX',
});

interface Ctx {
  s: State;
  set: (patch: Partial<State>) => void;
  setA: (patch: Partial<Answers>) => void;
  /* plan */
  rebuild: (a?: Answers) => void;
  setItem: (id: string, patch: Partial<PlanItem>) => void;
  toggleItem: (id: string) => void;
  addCustomItem: (name: string, section: string, amount: number) => void;
  /* guests */
  addGuest: (name: string) => void;
  updateGuest: (id: string, patch: Partial<Guest>) => void;
  removeGuest: (id: string) => void;
  cycleRSVP: (id: string) => void;
  importGuests: (text: string) => number;
  /* tables */
  addTable: () => boolean;
  seat: (tableId: string, guestId: string) => void;
  unseat: (guestId: string) => void;
  removeTable: (id: string) => void;
  /* todos, photos, quotes */
  addTodo: (name: string, who: string) => boolean;
  toggleTodo: (id: string) => void;
  removeTodo: (id: string) => void;
  addPhoto: (src: string, caption: string) => boolean;
  removePhoto: (id: string) => void;
  addQuote: (itemId: string, supplier: string, amt: number, note: string) => void;
  chooseQuote: (itemId: string, quoteId: string) => void;
  removeQuote: (itemId: string, quoteId: string) => void;
  /* misc */
  tickTask: (id: string) => void;
  tickPaper: (id: string) => void;
  unlock: () => void;
  reset: () => void;
  toast: (m: string) => void;
  toastMsg: string | null;
  sheet: string | null;
  sheetArg: string | null;
  openSheet: (name: string, arg?: string) => void;
  closeSheet: () => void;
}

const C = React.createContext<Ctx>(null as unknown as Ctx);
export const useStore = () => React.useContext(C);

export const Store: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [s, setS] = React.useState<State>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { const p = JSON.parse(raw); if (p && p.screen) return { ...blankState(), ...p }; }
    } catch { /* private mode, corrupt json — start fresh rather than crash */ }
    return blankState();
  });
  const [toastMsg, setToastMsg] = React.useState<string | null>(null);
  const [sheet, setSheet] = React.useState<string | null>(null);
  const [sheetArg, setSheetArg] = React.useState<string | null>(null);
  const timer = React.useRef<number | undefined>(undefined);

  React.useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* quota — the plan is still on screen */ }
  }, [s]);

  const set = (patch: Partial<State>) => setS(prev => ({ ...prev, ...patch }));
  const setA = (patch: Partial<Answers>) => setS(prev => ({ ...prev, a: { ...prev.a, ...patch } }));

  const toast = (m: string) => {
    setToastMsg(m);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToastMsg(null), 2200);
  };

  const rebuild = (a?: Answers) => setS(prev => {
    const ans = a || prev.a;
    const answers = { ...ans, budget: ans.budget || estimateBudget(ans), budgetEstimated: !ans.budget };
    return { ...prev, a: answers, plan: buildPlan(answers) };
  });

  const withPlan = (fn: (p: Plan, prev: State) => Plan) =>
    setS(prev => (prev.plan ? { ...prev, plan: fn(prev.plan, prev) } : prev));

  const setItem = (id: string, patch: Partial<PlanItem>) =>
    withPlan(p => ({ ...p, items: p.items.map(i => (i.id === id ? { ...i, ...patch } : i)) }));

  const toggleItem = (id: string) =>
    withPlan((p, prev) => {
      const items = p.items.map(i => (i.id === id ? { ...i, on: !i.on } : i));
      allocate(items, prev.a);          // switching a line off re-spreads its money
      return { ...p, items };
    });

  const addCustomItem = (name: string, section: string, amount: number) =>
    withPlan((p, prev) => ({
      ...p,
      items: [...p.items, {
        id: 'c' + uid(), name, section, note: 'Added by you.', essential: false,
        religious: false, supplier: '', share: 0, on: true, alloc: amount,
        agreed: amount || null, paid: 0,
      }],
    }));

  const addGuest = (name: string) => setS(prev => ({
    ...prev, guests: [...prev.guests, { id: uid(), name, side: 0, rsvp: 'pending', diet: '', plus: 0 }],
  }));
  const updateGuest = (id: string, patch: Partial<Guest>) => setS(prev => ({
    ...prev, guests: prev.guests.map(g => (g.id === id ? { ...g, ...patch } : g)),
  }));
  const removeGuest = (id: string) => setS(prev => ({
    ...prev,
    guests: prev.guests.filter(g => g.id !== id),
    tables: prev.tables.map(t => ({ ...t, g: t.g.filter(x => x !== id) })),
  }));
  const cycleRSVP = (id: string) => setS(prev => ({
    ...prev,
    guests: prev.guests.map(g => g.id === id
      ? { ...g, rsvp: g.rsvp === 'pending' ? 'yes' : g.rsvp === 'yes' ? 'no' : 'pending' }
      : g),
  }));

  /* "Name, dietary note, +2" per line — the format people actually paste from a phone note */
  const importGuests = (text: string) => {
    const rows = text.split('\n').map(r => r.trim()).filter(Boolean);
    const add: Guest[] = [];
    for (const row of rows) {
      const [rawName, ...rest] = row.split(',').map(x => x.trim());
      if (!rawName) continue;
      const tail = rest.join(', ');
      const plus = parseInt((tail.match(/\+\s*(\d)/) || [])[1] || '0', 10) || 0;
      const diet = tail.replace(/\+\s*\d/, '').trim();
      add.push({ id: uid(), name: rawName, side: 0, rsvp: 'pending', diet, plus });
    }
    if (add.length) setS(prev => ({ ...prev, guests: [...prev.guests, ...add] }));
    return add.length;
  };

  const addTable = () => {
    if (!s.unlocked && s.tables.length >= FREE_TABLE_CAP) return false;
    setS(prev => ({
      ...prev,
      tables: [...prev.tables, { id: uid(), name: 'Table ' + (prev.tables.length + 1), seats: 8, g: [] }],
    }));
    return true;
  };
  const seat = (tableId: string, guestId: string) => setS(prev => ({
    ...prev,
    tables: prev.tables.map(t => t.id === tableId
      ? { ...t, g: t.g.includes(guestId) ? t.g : [...t.g, guestId] }
      : { ...t, g: t.g.filter(x => x !== guestId) }),
  }));
  const unseat = (guestId: string) => setS(prev => ({
    ...prev, tables: prev.tables.map(t => ({ ...t, g: t.g.filter(x => x !== guestId) })),
  }));
  const removeTable = (id: string) => setS(prev => ({ ...prev, tables: prev.tables.filter(t => t.id !== id) }));

  const addTodo = (name: string, who: string) => {
    if (!s.unlocked && s.todos.length >= FREE_CUSTOM_CAP) return false;
    setS(prev => ({ ...prev, todos: [...prev.todos, { id: uid(), name, who, done: false }] }));
    return true;
  };
  const toggleTodo = (id: string) => setS(prev => ({
    ...prev, todos: prev.todos.map(t => (t.id === id ? { ...t, done: !t.done } : t)),
  }));
  const removeTodo = (id: string) => setS(prev => ({ ...prev, todos: prev.todos.filter(t => t.id !== id) }));

  const addPhoto = (src: string, caption: string) => {
    if (!s.unlocked && s.photos.length >= FREE_CUSTOM_CAP) return false;
    setS(prev => ({ ...prev, photos: [...prev.photos, { id: uid(), src, caption }] }));
    return true;
  };
  const removePhoto = (id: string) => setS(prev => ({ ...prev, photos: prev.photos.filter(p => p.id !== id) }));

  const addQuote = (itemId: string, supplier: string, amt: number, note: string) => setS(prev => ({
    ...prev,
    quotes: { ...prev.quotes, [itemId]: [...(prev.quotes[itemId] || []), { id: uid(), supplier, amt, note, chosen: false }] },
  }));
  const chooseQuote = (itemId: string, quoteId: string) => setS(prev => {
    const list = (prev.quotes[itemId] || []).map(q => ({ ...q, chosen: q.id === quoteId }));
    const won = list.find(q => q.chosen);
    return {
      ...prev,
      quotes: { ...prev.quotes, [itemId]: list },
      plan: prev.plan
        ? { ...prev.plan, items: prev.plan.items.map(i => (i.id === itemId && won ? { ...i, agreed: won.amt } : i)) }
        : prev.plan,
    };
  });
  const removeQuote = (itemId: string, quoteId: string) => setS(prev => ({
    ...prev, quotes: { ...prev.quotes, [itemId]: (prev.quotes[itemId] || []).filter(q => q.id !== quoteId) },
  }));

  const tickTask = (id: string) =>
    withPlan(p => ({ ...p, timeline: p.timeline.map(t => (t.id === id ? { ...t, done: !t.done } : t)) }));
  const tickPaper = (id: string) =>
    withPlan(p => ({ ...p, paperwork: p.paperwork.map(t => (t.id === id ? { ...t, done: !t.done } : t)) }));

  const unlock = () => { set({ unlocked: true }); setSheet(null); toast('All yours now — go and enjoy it.'); };
  const reset = () => { try { localStorage.removeItem(KEY); } catch { /* nothing to clear */ } setS(blankState()); };

  const openSheet = (name: string, arg?: string) => { setSheet(name); setSheetArg(arg || null); };
  const closeSheet = () => { setSheet(null); setSheetArg(null); };

  const value: Ctx = {
    s, set, setA, rebuild, setItem, toggleItem, addCustomItem,
    addGuest, updateGuest, removeGuest, cycleRSVP, importGuests,
    addTable, seat, unseat, removeTable,
    addTodo, toggleTodo, removeTodo, addPhoto, removePhoto,
    addQuote, chooseQuote, removeQuote,
    tickTask, tickPaper, unlock, reset,
    toast, toastMsg, sheet, sheetArg, openSheet, closeSheet,
  };
  return <C.Provider value={value}>{children}</C.Provider>;
};

/* Derived numbers used in several places */
export const headcount = (guests: Guest[]) =>
  guests.filter(g => g.rsvp !== 'no').reduce((n, g) => n + 1 + (g.plus || 0), 0);
export const plannedTotal = (plan: Plan | null) =>
  plan ? plan.items.filter(i => i.on).reduce((n, i) => n + (i.agreed ?? i.alloc ?? 0), 0) : 0;
export const paidTotal = (plan: Plan | null) =>
  plan ? plan.items.filter(i => i.on).reduce((n, i) => n + (i.paid || 0), 0) : 0;

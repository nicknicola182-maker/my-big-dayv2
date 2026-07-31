import { PACKS } from '@/data/packs';
import { COUNTRIES, PRIORITIES, guestBands, budgetBands, type Answers, type PackId } from '@/engine';
import type { WorldId } from '@/world/personas';

export type StepType = 'names' | 'pick' | 'date' | 'guests' | 'budget' | 'events' | 'multi';

export interface Step {
  id: string;
  type: StepType;
  eyebrow: Record<WorldId, string>;
  title: Record<WorldId, string>;
  sub: string;
  options?: { v: string; l: string; d?: string }[];
  skippable?: boolean;
}

const t = (dressing: string, order: string, linen: string, monograph: string) =>
  ({ dressing, order, linen, monograph });

export function steps(a: Answers): Step[] {
  const out: Step[] = [
    {
      id: 'names', type: 'names',
      eyebrow: t('THE HAPPY COUPLE', 'ITEM ONE', 'first things first', 'THE SUBJECTS'),
      title: t('Who am I marrying off?', 'Who is getting married?', 'Who have we got then?', 'WHO ARE WE DRESSING?'),
      sub: 'Two names, exactly as they’ll appear on the invitations.',
    },
    {
      id: 'faith', type: 'pick',
      eyebrow: t('THE TRADITION', 'ITEM TWO', 'your family’s way', 'THE TRADITION'),
      title: t('Whose tradition are we honouring?', 'Which tradition holds the day?', 'How were you both raised?', 'WHOSE TRADITION HOLDS THE DAY?'),
      sub: 'This decides your celebrations, your paperwork and half your budget.',
      options: [
        { v: 'greek-orthodox', l: 'Greek Orthodox', d: PACKS['greek-orthodox'].blurb },
        { v: 'hindu', l: 'Hindu', d: PACKS['hindu'].blurb },
        { v: 'jewish', l: 'Jewish', d: PACKS['jewish'].blurb },
        { v: 'civil', l: 'Civil / no religion', d: PACKS['civil'].blurb },
      ],
    },
    {
      id: 'country', type: 'pick',
      eyebrow: t('THE WHERE', 'ITEM THREE', 'where’s it happening', 'THE LOCATION'),
      title: t('Where’s the magic happening?', 'Which country hosts the wedding?', 'Where are we all going then?', 'WHERE IS THIS HAPPENING?'),
      sub: 'The country sets the prices, the paperwork and the light.',
      options: COUNTRIES.map(c => ({ v: c[0], l: c[1] })),
    },
    {
      id: 'date', type: 'date', skippable: true,
      eyebrow: t('THE WHEN', 'ITEM FOUR', 'have you a day in mind', 'THE DATE'),
      title: t('Got a date yet?', 'Have you a date in mind?', 'When were you thinking, love?', 'WHEN DO WE GO TO PRESS?'),
      sub: 'A rough one is fine — I’ll count the whole timeline back from it.',
    },
    {
      id: 'guests', type: 'guests',
      eyebrow: t('THE CROWD', 'ITEM FIVE', 'how many are we feeding', 'CIRCULATION'),
      title: t('How big are we dreaming?', 'How many guests?', 'How many are we feeding?', 'HOW MANY IN THE ROOM?'),
      sub: 'Roughly will do. Guest lists move — they always do.',
    },
    {
      id: 'budget', type: 'budget', skippable: true,
      eyebrow: t('THE MONEY', 'ITEM SIX', 'the money bit', 'THE BUDGET'),
      title: t('What are we spending, babe?', 'And the budget?', 'What can we sensibly spend?', 'WHAT IS THE BUDGET?'),
      sub: 'Say it plainly or skip it — I’ll draft a figure you can argue with.',
    },
    {
      id: 'events', type: 'events',
      eyebrow: t('YOUR CELEBRATIONS', 'ITEM SEVEN', 'all the bits', 'THE RUNNING ORDER'),
      title: t('Which of these are we keeping?', 'Which celebrations are yours?', 'Which of these are we doing?', 'WHICH OF THESE RUN?'),
      sub: 'Your tradition’s full calendar. Anything you switch off leaves the plan, budget and timeline together.',
    },
    {
      id: 'priorities', type: 'multi', skippable: true,
      eyebrow: t('THE SPLURGE', 'ITEM EIGHT', 'what matters most', 'THE EDIT'),
      title: t('What deserves the deep end?', 'What takes priority?', 'What matters most to you two?', 'WHAT GETS THE MONEY?'),
      sub: 'Three at most — I’ll guard them when the numbers tighten.',
    },
    {
      id: 'style', type: 'pick', skippable: true,
      eyebrow: t('THE FEELING', 'ITEM NINE', 'the feel of the day', 'THE MOOD'),
      title: t('Give me one word.', 'Describe the day in a word.', 'What sort of do is it?', 'ONE WORD.'),
      sub: 'Whichever you choose, we do it properly.',
      options: [
        { v: 'Traditional', l: 'Traditional', d: 'The classics, done properly.' },
        { v: 'Modern', l: 'Modern', d: 'Clean lines, bold choices.' },
        { v: 'Relaxed', l: 'Relaxed', d: 'Barefoot by dessert.' },
        { v: 'Formal', l: 'Formal', d: 'Black tie, everyone devastating.' },
        { v: 'Rustic', l: 'Rustic', d: 'Barns, festoon lights, wildflowers.' },
        { v: 'Glamorous', l: 'Glamorous', d: 'Full drama — sparkle, velvet, an entrance.' },
      ],
    },
  ];
  return out;
}

export function canAdvance(step: Step, a: Answers): boolean {
  switch (step.id) {
    case 'names': return !!(a.n1.trim() && a.n2.trim());
    case 'faith': return !!a.packId;
    case 'country': return !!a.country;
    case 'guests': return !!a.guests;
    default: return true;
  }
}

export { guestBands, budgetBands, PRIORITIES };
export type { PackId };

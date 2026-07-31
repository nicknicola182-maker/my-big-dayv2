import React from 'react';
import './fonts.css';
import { PERSONAS, byId, say, type WorldId } from '@/world/personas';
import { blankAnswers, buildPlan, estimateBudget, type Answers } from '@/engine';
import { Store, useStore } from '@/store';
import { Gate } from '@/screens/Gate';
import { Questions } from '@/screens/Questions';
import { Reveal } from '@/screens/Reveal';
import { Shell } from '@/screens/Shell';
import { useWorld, Display, Hand, WButton, Phone, Sparkles, Bulbs } from '@/world/ui';

/* Seeded so the prototype is one tap from something worth looking at. */
const DEMO: Partial<Answers> = {
  n1: 'Andreas', n2: 'Sophia', packId: 'greek-orthodox', country: 'CY',
  dateISO: '2027-06-12', guests: 300, budget: 42000,
  priorities: ['Food & drink', 'Music & dancing'], style: 'Glamorous',
};
const DEMO_GUESTS = [
  ['Kyriakos Papadopoulos', 'koumbaros', 2, 'yes'], ['Eleni Christofi', 'gluten free', 0, 'yes'],
  ['The Georgiou family', 'chairetisma only', 3, 'pending'], ['Yiannis Loizou', '', 0, 'no'],
  ['Maria & Andreas Nicola', '', 2, 'yes'], ['Anna Demetriou', 'vegetarian', 0, 'pending'],
] as const;

function Inner() {
  const st = useStore();
  const { s } = st;
  const w = useWorld(s.world);
  const p = byId(s.world);

  const finish = () => {
    const answers: Answers = { ...s.a, budget: s.a.budget || estimateBudget(s.a), budgetEstimated: !s.a.budget };
    st.set({ a: answers, plan: buildPlan(answers), screen: 'reveal' });
  };

  const jumpToDemo = () => {
    const a = { ...blankAnswers(), ...DEMO } as Answers;
    st.set({
      a, plan: buildPlan(a), screen: 'app', tab: 'home',
      guests: DEMO_GUESTS.map(([name, diet, plus, rsvp], i) => ({
        id: 'g' + i, name, diet, plus, rsvp: rsvp as 'yes' | 'no' | 'pending', side: 0 as const,
      })),
      todos: [{ id: 'd1', name: 'Ask Uncle Tak to read at the service', who: 'Us', done: false }],
    });
  };

  const restart = () => st.set({ a: blankAnswers(), qi: 0, plan: null, screen: 'landing', guests: [], todos: [], photos: [], tables: [] });
  const swap = () => st.set({ screen: 'gate' });

  const landing = (
    <Phone w={w}>
      <Sparkles on={s.world === 'dressing'} />
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: `0 ${w.gutter}`, textAlign: s.world === 'linen' ? 'left' : 'center',
      }}>
        {s.world === 'dressing' && <div style={{ marginBottom: 22 }}><Bulbs n={7} /></div>}
        {s.world === 'monograph' && <div style={{ height: 2, background: w.ink, marginBottom: 20 }} />}
        <div style={{ fontSize: 9.5, letterSpacing: '.32em', textTransform: 'uppercase', color: w.metal, fontWeight: 700 }}>
          {say('landingKicker', s.world)}
        </div>
        <Display w={w} size={s.world === 'monograph' ? 38 : 40} style={{ margin: '14px 0 16px' }}>
          {say('landingTitle', s.world)}
        </Display>
        <div style={{ fontSize: 13.5, color: w.ink2, lineHeight: 1.6, marginBottom: 10 }}>{say('landingBody', s.world)}</div>
        <Hand w={w} size={17} color={w.accent}>{p.quote}</Hand>
        <div style={{ marginTop: 24 }}>
          <WButton w={w} full onClick={() => st.set({ qi: 0, screen: 'q' })}>{say('landingCta', s.world)}</WButton>
          <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
            <WButton w={w} variant="ghost" style={{ flex: 1, fontSize: 11.5, padding: '11px 8px' }} onClick={swap}>← planner</WButton>
            <WButton w={w} variant="ghost" style={{ flex: 1, fontSize: 11.5, padding: '11px 8px' }} onClick={jumpToDemo}>see a full plan</WButton>
          </div>
        </div>
      </div>
    </Phone>
  );

  const phone = () => {
    if (s.screen === 'gate') return <Gate onPick={id => st.set({ world: id, screen: 'landing' })} />;
    if (s.screen === 'q') return (
      <Questions world={s.world} a={s.a} set={st.setA} i={s.qi}
        go={n => st.set({ qi: n })} finish={finish} onSwap={swap} />
    );
    if (s.screen === 'reveal' && s.plan) return (
      <Reveal world={s.world} a={s.a} plan={s.plan} onEnter={() => st.set({ screen: 'app', tab: 'home' })} />
    );
    if (s.screen === 'app' && s.plan) return <Shell world={s.world} onSwap={swap} onRestart={restart} />;
    return landing;
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#E9DFDA', fontFamily: 'Outfit, system-ui, sans-serif',
      display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px 40px',
    }}>
      <style>{`
        @keyframes mbdSpark{0%,100%{opacity:0;transform:scale(.4)}50%{opacity:1;transform:scale(1)}}
        *{box-sizing:border-box}
        button,input,select,textarea{font-family:inherit}
        ::-webkit-scrollbar{width:0;height:0}
      `}</style>

      <div style={{ textAlign: 'center', marginBottom: 14, maxWidth: 600 }}>
        <div style={{ fontFamily: "'Gloock', Georgia, serif", fontSize: 26, color: '#33262B' }}>My Big Day</div>
        <div style={{ fontSize: 12.5, color: '#7A5F6B', marginTop: 6, lineHeight: 1.5 }}>
          The wedding planner who knows your traditions. Choose a planner and the whole app changes —
          skeleton, navigation, typography and voice, not just colour.
        </div>
      </div>

      {s.screen !== 'gate' && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {PERSONAS.map(x => (
            <button key={x.id} onClick={() => st.set({ world: x.id })} style={{
              padding: '7px 12px', borderRadius: 20, cursor: 'pointer', fontSize: 11.5, fontWeight: 600,
              border: s.world === x.id ? 'none' : '1.5px solid #E0D3CE',
              background: s.world === x.id ? x.avatar : '#fff',
              color: s.world === x.id ? x.avatarInk : '#7A5F6B',
            }}>{x.first} · {x.worldName.replace('The ', '')}</button>
          ))}
        </div>
      )}

      {phone()}

      <div style={{ fontSize: 11, color: '#9A8189', marginTop: 14, textAlign: 'center', maxWidth: 440, lineHeight: 1.5 }}>
        Four real culture packs driving live budget allocation, a timeline counted back from your date,
        and the jurisdiction’s actual paperwork. Everything you change is saved on this device.
      </div>
    </div>
  );
}

export default function App() {
  return <Store><Inner /></Store>;
}

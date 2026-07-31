import React from 'react';
import { PACKS } from '@/data/packs';
import { money, sectionTotals, daysToGo, dateInWords, countryOf, type Answers, type Plan } from '@/engine';
import { byId, say, type WorldId } from '@/world/personas';
import { useWorld, Display, Eyebrow, Hand, WButton, Phone, Scroll, Sparkles, Bulbs, Rule } from '@/world/ui';

export const Reveal: React.FC<{ world: WorldId; a: Answers; plan: Plan; onEnter: () => void }> =
  ({ world, a, plan, onEnter }) => {
    const w = useWorld(world), p = byId(world);
    const pack = PACKS[a.packId!];
    const cur = countryOf(a.country)[2];
    const names = [a.n1, a.n2].filter(Boolean).join(' & ') || 'Your wedding';
    const days = daysToGo(a.dateISO);
    const sections = sectionTotals(plan.items).slice(0, 5);
    const on = plan.items.filter(i => i.on).length;

    const stat = (n: string | number, l: string) => (
      <div style={{
        border: w.edge === 'none' ? `1px solid ${w.rule}` : w.edge, borderRadius: w.radius,
        padding: '13px 8px', textAlign: 'center', background: w.surface,
      }}>
        <div style={{ fontFamily: w.display, fontSize: 24, color: w.accent, lineHeight: 1 }}>{n}</div>
        <div style={{ fontSize: 8.5, letterSpacing: '.16em', textTransform: 'uppercase', color: w.ink3, marginTop: 5 }}>{l}</div>
      </div>
    );

    return (
      <Phone w={w}>
        <Sparkles on={world === 'dressing'} />
        <Scroll w={w} style={{ paddingTop: 26 }}>
          {world === 'dressing' && <div style={{ marginBottom: 14 }}><Bulbs n={7} /></div>}
          {world === 'monograph' && <div style={{ height: 2, background: w.ink, marginBottom: 14 }} />}

          <div style={{ textAlign: world === 'linen' ? 'left' : 'center' }}>
            <Hand w={w} size={20}>{say('revealKicker', world)}</Hand>
            <Display w={w} size={34} style={{ marginTop: 6 }}>{names}</Display>
            <div style={{ fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', color: w.ink3, marginTop: 12, lineHeight: 1.9 }}>
              {pack.name} · {countryOf(a.country)[1]}
              {a.dateISO ? <><br />{dateInWords(a.dateISO)}</> : null}
              {days != null ? <><br />{days} days to go</> : null}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '22px 0 18px' }}>
            {stat(plan.events.length, 'celebrations')}
            {stat(on, 'budget lines')}
            {stat(plan.timeline.length, 'tasks, dated')}
            {stat(plan.paperwork.length, 'legal papers')}
          </div>

          <div style={{
            background: w.surface, borderRadius: w.radius, border: w.edge,
            boxShadow: w.shadow, padding: 16,
          }}>
            <Eyebrow w={w} color={w.accent}>{a.budgetEstimated ? 'DRAFTED FOR YOU' : 'YOUR PLAN'}</Eyebrow>
            <Display w={w} size={19} style={{ margin: '6px 0 10px' }}>The whole beautiful bill</Display>
            {sections.map(([name, total]) => (
              <div key={name} style={{
                display: 'flex', alignItems: 'baseline', gap: 8, padding: '7px 0',
                borderTop: `1px solid ${w.rule}`,
              }}>
                <span style={{ fontSize: 13, color: w.ink2 }}>{name}</span>
                <span style={{ flex: 1, borderBottom: `1.5px dotted ${w.rule}`, marginBottom: 3 }} />
                <span style={{ fontFamily: w.display, fontSize: 15 }}>{money(total, cur)}</span>
              </div>
            ))}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              paddingTop: 11, marginTop: 7, borderTop: `1.5px solid ${w.accent}`,
            }}>
              <span style={{ fontFamily: w.display, fontSize: 17 }}>{money(a.budget || 0, cur)} all in</span>
              {a.guests ? <span style={{ fontSize: 11.5, color: w.ink3 }}>{money((a.budget || 0) / a.guests, cur)} a head</span> : null}
            </div>
          </div>

          <div style={{ fontSize: 13, lineHeight: 1.6, color: w.ink2, margin: '16px 0 20px' }}>
            {say('revealBody', world)}
          </div>
        </Scroll>

        <div style={{ flex: 'none', padding: `12px ${w.gutter} 24px` }}>
          <WButton w={w} full onClick={onEnter}>{say('revealCta', world)}</WButton>
        </div>
      </Phone>
    );
  };

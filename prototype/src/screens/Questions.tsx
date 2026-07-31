import React from 'react';
import { PACKS } from '@/data/packs';
import { COUNTRIES, guestBands, budgetBands, PRIORITIES, money, type Answers, type PackId } from '@/engine';
import { steps, canAdvance } from '@/questions';
import { byId, say, type WorldId } from '@/world/personas';
import { useWorld, Display, Eyebrow, Hand, WButton, Option, Progress, Phone, Scroll, Sparkles, Bulbs, Rule } from '@/world/ui';

interface Props {
  world: WorldId; a: Answers; set: (patch: Partial<Answers>) => void;
  i: number; go: (n: number) => void; finish: () => void; onSwap: () => void;
}

export const Questions: React.FC<Props> = ({ world, a, set, i, go, finish, onSwap }) => {
  const w = useWorld(world), p = byId(world);
  const all = steps(a);
  const step = all[i];
  const total = all.length;
  const pack = a.packId ? PACKS[a.packId] : null;
  const cur = budgetBands(a.country).cur;
  const ok = canAdvance(step, a);

  const react = reaction(step.id, a);

  const header = (
    <div style={{ flex: 'none', padding: `16px ${w.gutter} 0` }}>
      {w.progress === 'bulbs' && <Bulbs n={7} />}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: w.progress === 'bulbs' ? 10 : 0,
      }}>
        <span onClick={() => (i === 0 ? onSwap() : go(i - 1))} style={{
          fontSize: 11.5, color: w.ink3, cursor: 'pointer', letterSpacing: w.btnTrack === '.24em' ? '.18em' : 0,
          textTransform: w.btnTrack === '.24em' ? 'uppercase' : 'none',
        }}>‹ {i === 0 ? 'planner' : say('back', world)}</span>

        {w.progress === 'bulbs'
          ? <span style={{ fontSize: 9, letterSpacing: '.28em', color: w.metal, fontWeight: 700 }}>
              {p.name.split(' ')[0].toUpperCase()} · {i + 1} OF {total}
            </span>
          : <Progress w={w} i={i} total={total} />}
      </div>
      {w.progress === 'roman' && <Rule w={w} />}
      {w.progress === 'numero' && <div style={{ height: 2, background: w.ink, marginTop: 10 }} />}
      {w.progress === 'bulbs' && <div style={{ marginTop: 10 }}><Progress w={w} i={i} total={total} /></div>}
    </div>
  );

  return (
    <Phone w={w}>
      <Sparkles on={world === 'dressing'} />
      {header}

      <Scroll w={w} style={{ paddingTop: 16 }}>
        {/* Perdita puts a giant outlined numeral behind the headline */}
        {w.progress === 'numero' && (
          <div style={{
            fontFamily: w.display, fontSize: 108, lineHeight: .8, color: 'transparent',
            WebkitTextStroke: '1.5px #D9D2C8', marginLeft: -4, marginBottom: -34, userSelect: 'none',
          }}>{String(i + 1).padStart(2, '0')}</div>
        )}

        <Eyebrow w={w} color={w.metal}>{step.eyebrow[world]}</Eyebrow>
        <Display w={w} size={w.progress === 'numero' ? 32 : 29} style={{ marginTop: 8 }}>
          {step.title[world]}
        </Display>
        <div style={{ fontSize: 13, color: w.ink3, marginTop: 8, lineHeight: 1.55 }}>{step.sub}</div>

        <div style={{ marginTop: 20, paddingBottom: 8 }}>
          {step.type === 'names' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {(['n1', 'n2'] as const).map((k, ix) => (
                <label key={k} style={{ display: 'block' }}>
                  <Eyebrow w={w}>{ix === 0 ? 'You' : 'Your love'}</Eyebrow>
                  <input value={a[k]} onChange={e => set({ [k]: e.target.value } as Partial<Answers>)}
                    placeholder={ix === 0 ? 'Your name' : 'Their name'}
                    style={{
                      fontFamily: w.display, fontSize: 22, width: '100%', marginTop: 6,
                      border: 'none', borderBottom: `1.5px solid ${w.accent}`, background: 'transparent',
                      color: w.ink, outline: 'none', padding: '6px 2px', borderRadius: 0,
                    }} />
                </label>
              ))}
            </div>
          )}

          {step.type === 'pick' && (
            <div style={{
              display: w.nav === 'objects' ? 'grid' : 'flex',
              gridTemplateColumns: w.nav === 'objects' ? '1fr 1fr' : undefined,
              flexDirection: 'column', gap: w.nav === 'objects' ? 14 : (w.nav === 'composer' ? 0 : 0),
              ...(w.nav === 'composer' ? {
                background: '#FFFDFA', border: `2px solid ${w.metal}`, borderRadius: 20,
                boxShadow: '0 0 0 5px rgba(232,190,110,.14), 0 14px 34px rgba(120,35,90,.14)',
                padding: '10px 14px 12px',
              } : {}),
            }}>
              {w.nav === 'composer' && <div style={{ padding: '2px 0 8px' }}><Bulbs n={5} gap={16} /></div>}
              {step.options!.map((o, ix) => (
                <Option key={o.v} w={w} index={ix} label={o.l} desc={o.d}
                  on={pickValue(step.id, a) === o.v}
                  onClick={() => set(patchFor(step.id, o.v))} />
              ))}
            </div>
          )}

          {step.type === 'date' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input type="date" value={a.dateISO} onChange={e => set({ dateISO: e.target.value })}
                style={{
                  fontFamily: 'inherit', fontSize: 16, padding: '14px 15px', width: '100%',
                  border: `1.5px solid ${w.rule}`, borderRadius: w.radiusSm, background: w.surface, color: w.ink,
                }} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {[['Spring 2027', '2027-04-24'], ['Summer 2027', '2027-06-12'], ['Autumn 2027', '2027-09-18'], ['Summer 2028', '2028-07-01']].map(([l, iso]) => (
                  <button key={iso} onClick={() => set({ dateISO: iso })} style={{
                    padding: '10px 15px', borderRadius: w.btnRadius, cursor: 'pointer', fontFamily: 'inherit',
                    fontSize: 12.5, fontWeight: 600,
                    border: a.dateISO === iso ? 'none' : `1.5px solid ${w.rule}`,
                    background: a.dateISO === iso ? w.accentGrad : w.surface,
                    color: a.dateISO === iso ? w.accentInk : w.ink,
                  }}>{l}</button>
                ))}
              </div>
            </div>
          )}

          {step.type === 'guests' && (
            <div style={{
              display: w.nav === 'objects' ? 'grid' : 'flex', gridTemplateColumns: w.nav === 'objects' ? '1fr 1fr' : undefined,
              flexDirection: 'column', gap: w.nav === 'objects' ? 14 : 0,
            }}>
              {guestBands().map((b, ix) => (
                <Option key={b.label} w={w} index={ix} label={b.label} desc={b.note}
                  on={a.guests === b.mid} onClick={() => set({ guests: b.mid })} />
              ))}
              <div style={{ marginTop: 14 }}>
                <Eyebrow w={w}>or exactly</Eyebrow>
                <input inputMode="numeric" value={a.guests && !guestBands().some(b => b.mid === a.guests) ? String(a.guests) : ''}
                  onChange={e => set({ guests: parseInt(e.target.value.replace(/\D/g, ''), 10) || null })}
                  placeholder="e.g. 250"
                  style={{
                    fontFamily: w.display, fontSize: 20, width: '100%', marginTop: 6, textAlign: 'center',
                    border: 'none', borderBottom: `1.5px solid ${w.rule}`, background: 'transparent',
                    color: w.ink, outline: 'none', padding: '8px 2px', borderRadius: 0,
                  }} />
              </div>
            </div>
          )}

          {step.type === 'budget' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {budgetBands(a.country).bands.map((b, ix) => (
                <Option key={b.label} w={w} index={ix} label={b.label}
                  on={a.budget === b.mid && !a.budgetEstimated}
                  onClick={() => set({ budget: b.mid, budgetEstimated: false })} />
              ))}
              <div style={{ marginTop: 14 }}>
                <WButton w={w} variant="ghost" full
                  onClick={() => set({ budget: null, budgetEstimated: true })}>
                  {a.budgetEstimated ? '✓ ' : ''}I honestly don’t know — draft me one
                </WButton>
              </div>
            </div>
          )}

          {step.type === 'events' && pack && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pack.events.map(e => {
                const on = (a.eventsOn || pack.events.filter(x => x.default !== false).map(x => x.id)).includes(e.id);
                return (
                  <div key={e.id} onClick={() => {
                    const base = a.eventsOn || pack.events.filter(x => x.default !== false).map(x => x.id);
                    set({ eventsOn: on ? base.filter(x => x !== e.id) : [...base, e.id] });
                  }} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '11px 13px', cursor: 'pointer',
                    borderRadius: w.radiusSm, background: on ? w.surface : 'transparent',
                    border: `1px solid ${on ? w.accent : w.rule}`, opacity: on ? 1 : .6,
                  }}>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600 }}>{e.name}</span>
                      <span style={{ display: 'block', fontSize: 11, color: w.ink3, marginTop: 2 }}>{e.when}</span>
                    </span>
                    <span style={{
                      width: 38, height: 22, borderRadius: 12, flex: 'none', position: 'relative',
                      background: on ? '#9BC0A6' : '#E0D6D0',
                    }}>
                      <i style={{
                        position: 'absolute', top: 3, left: on ? 19 : 3, width: 16, height: 16,
                        borderRadius: '50%', background: '#fff', transition: 'left .16s',
                      }} />
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {step.type === 'multi' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {PRIORITIES.map(v => {
                const on = a.priorities.includes(v);
                return (
                  <button key={v} onClick={() => set({
                    priorities: on ? a.priorities.filter(x => x !== v)
                      : a.priorities.length < 3 ? [...a.priorities, v] : a.priorities,
                  })} style={{
                    padding: '10px 15px', borderRadius: w.btnRadius === '0px' ? 0 : 20, cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                    border: on ? 'none' : `1.5px solid ${w.rule}`,
                    background: on ? w.accentGrad : w.surface, color: on ? w.accentInk : w.ink,
                  }}>{v}</button>
                );
              })}
            </div>
          )}
        </div>

        {/* She answers back — always from the pack, never generic praise */}
        {react && (
          <div style={{
            marginTop: 6, marginBottom: 14, padding: '13px 15px',
            borderRadius: w.radius, borderLeft: `3px solid ${w.accent}`,
            background: world === 'dressing' ? 'linear-gradient(150deg,#8A1F63,#4E1140)' : w.surface,
            color: world === 'dressing' ? '#FBEDF4' : w.ink2,
            border: world === 'dressing' ? 'none' : w.edge,
          }}>
            <Hand w={w} color={world === 'dressing' ? '#F5D8A8' : w.accent}>{react.lead[world]}</Hand>
            <div style={{ fontSize: 12.5, lineHeight: 1.55, marginTop: 5 }}>{react.body}</div>
            <div style={{ fontSize: 11, marginTop: 7, opacity: .75, fontWeight: 700 }}>{p.signoff}</div>
          </div>
        )}
      </Scroll>

      <div style={{ flex: 'none', padding: `12px ${w.gutter} 22px`, display: 'flex', gap: 12, alignItems: 'center' }}>
        {step.skippable && (
          <span onClick={() => (i === total - 1 ? finish() : go(i + 1))} style={{
            fontSize: 12.5, color: w.ink3, textDecoration: 'underline', cursor: 'pointer', whiteSpace: 'nowrap',
          }}>{say('skip', world)}</span>
        )}
        <WButton w={w} full disabled={!ok}
          onClick={() => ok && (i === total - 1 ? finish() : go(i + 1))}>
          {i === total - 1 ? say('build', world) : say('next', world)} →
        </WButton>
      </div>
    </Phone>
  );
};

/* which answer this step owns */
function pickValue(id: string, a: Answers): string {
  if (id === 'faith') return a.packId || '';
  if (id === 'country') return a.country;
  if (id === 'style') return a.style;
  return '';
}
function patchFor(id: string, v: string): Partial<Answers> {
  if (id === 'faith') return { packId: v as PackId, eventsOn: null };
  if (id === 'country') return { country: v };
  if (id === 'style') return { style: v };
  return {};
}

/* Reactions are lifted from the packs' own gotchas — the moat, felt in the first minute. */
function reaction(stepId: string, a: Answers): { lead: Record<WorldId, string>; body: string } | null {
  if (!a.packId) return null;
  const pack = PACKS[a.packId];
  const lead = (d: string, o: string, l: string, m: string) => ({ dressing: d, order: o, linen: l, monograph: m });

  if (stepId === 'country' && a.country) {
    const g = pack.gotchas.find(x => /legal|register|licen|notice|certificat/i.test(x)) || pack.gotchas[0];
    return { lead: lead('obsessed.', 'Noted.', 'lovely choice, that', 'NOTED.'), body: g };
  }
  if (stepId === 'date' && a.dateISO) {
    const g = pack.gotchas.find(x => /date|fast|season|calendar|muhurat|Lent|Omer/i.test(x));
    if (g) return { lead: lead('hold on, babe —', 'Before you fix that —', 'ooh, one thing first', 'ONE MOMENT.'), body: g };
  }
  if (stepId === 'guests' && (a.guests || 0) >= 220) {
    const g = pack.gotchas.find(x => /guest|list|numbers|cater/i.test(x)) || pack.gotchas[1];
    return { lead: lead('now THAT’s a wedding.', 'Noted.', 'oh, a proper crowd!', 'AMBITIOUS.'), body: g };
  }
  if (stepId === 'events') {
    const c = pack.customs[0];
    return { lead: lead('the good bit —', 'For reference.', 'this one’s lovely', 'CONTEXT.'), body: `${c.name} — ${c.description}` };
  }
  return null;
}

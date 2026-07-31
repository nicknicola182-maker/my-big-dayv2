import React from 'react';
import { PACKS } from '@/data/packs';
import { money, sectionTotals, daysToGo, dateInWords, dateShort, countryOf } from '@/engine';
import { useStore, headcount, plannedTotal, paidTotal, FREE_CUSTOM_CAP, PRICE } from '@/store';
import { byId, say, type WorldId } from '@/world/personas';
import { useWorld, Display, Eyebrow, Hand, WCard, WButton, Phone, Scroll, Sparkles, Rule } from '@/world/ui';
import { Sheets } from './Sheets';

type Tab = 'home' | 'budget' | 'guests' | 'list' | 'album' | 'more';

export const Shell: React.FC<{ world: WorldId; onSwap: () => void; onRestart: () => void }> =
  ({ world, onSwap, onRestart }) => {
    const w = useWorld(world), p = byId(world);
    const st = useStore();
    const { s } = st;
    const [customIx, setCustomIx] = React.useState(0);
    const [filter, setFilter] = React.useState<'all' | 'tasks' | 'paper' | 'mine'>('all');
    const [openSec, setOpenSec] = React.useState<string | null>(null);
    const fileRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => { st.set({ tab: 'home' }); }, [world]);   // a new planner opens their own front page

    if (!s.plan) return null;
    const tab = (s.tab || 'home') as Tab;
    const setTab = (t: Tab) => st.set({ tab: t });
    const pack = PACKS[s.a.packId!];
    const cur = countryOf(s.a.country)[2];
    const dark = w.darkHome && tab === 'home';

    const heads = headcount(s.guests) || s.a.guests || 0;
    const planned = plannedTotal(s.plan) || s.a.budget || 0;
    const paid = paidTotal(s.plan);
    const days = daysToGo(s.a.dateISO);
    const sections = sectionTotals(s.plan.items);
    const openTask = s.plan.timeline.find(t => !t.done);
    const custom = pack.customs[customIx % pack.customs.length];
    const doneCount = s.plan.timeline.filter(t => t.done).length
      + s.plan.paperwork.filter(x => x.done).length + s.todos.filter(t => t.done).length;
    const totalCount = s.plan.timeline.length + s.plan.paperwork.length + s.todos.length;
    const pct = Math.round((doneCount / Math.max(1, totalCount)) * 100);

    /* ── home, four skeletons ─────────────────────────────────────────── */
    const home = () => {
      if (world === 'dressing') return (
        <>
          <div style={{
            margin: '20px 0 0', border: `2px solid ${w.metal}`, borderRadius: 18, background: '#1C0619',
            boxShadow: '0 0 0 5px rgba(232,190,110,.12), 0 16px 40px rgba(0,0,0,.4)',
            padding: '12px 16px 14px', textAlign: 'center',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2px 9px' }}>
              {Array.from({ length: 8 }, (_, k) => (
                <span key={k} style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 35%,#FBE7BE,#E8BE6E)',
                  boxShadow: '0 0 9px rgba(232,190,110,1)',
                }} />
              ))}
            </div>
            <div style={{ fontFamily: w.display, fontSize: 24, letterSpacing: '.05em', color: '#F5D8A8', textShadow: '0 0 22px rgba(232,190,110,.55)' }}>
              {s.a.n1.toUpperCase()} <span style={{ color: '#E783B8' }}>♥</span> {s.a.n2.toUpperCase()}
            </div>
            <div style={{ fontSize: 9, letterSpacing: '.3em', color: '#D9A8C6', marginTop: 6 }}>
              {days != null ? `${days} SLEEPS TO SHOWTIME` : 'A DATE STILL TO CHOOSE'}
            </div>
            <Hand w={w} color="#F2A9CF" size={14}>{s.a.dateISO ? dateInWords(s.a.dateISO).toLowerCase() : 'pick us a day, babe'}</Hand>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 16 }}>
            {([['budget', money(planned, cur), 'PLANNED'], ['guests', String(heads), 'COMING'], ['list', pct + '%', 'SETTLED']] as const).map(([t, v, l]) => (
              <span key={t} onClick={() => setTab(t as Tab)} style={{
                width: 78, height: 78, borderRadius: '50%', cursor: 'pointer',
                border: '2px solid rgba(232,190,110,.7)', background: 'rgba(255,255,255,.05)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 20px rgba(232,190,110,.15)',
              }}>
                <b style={{ fontFamily: w.display, fontSize: 15, color: '#F5D8A8' }}>{v}</b>
                <i style={{ fontSize: 8, letterSpacing: '.16em', color: '#D9A8C6', marginTop: 3, fontStyle: 'normal' }}>{l}</i>
              </span>
            ))}
          </div>
        </>
      );

      if (world === 'order') return (
        <>
          <div style={{ paddingTop: 22, position: 'relative' }}>
            <Eyebrow w={w}>THE WEDDING OF</Eyebrow>
            <Display w={w} size={28} style={{ marginTop: 8 }}>{s.a.n1} &amp;{'\n'}{s.a.n2}</Display>
            <div style={{ fontFamily: w.display, fontStyle: 'italic', fontSize: 13, color: w.ink2, marginTop: 8, maxWidth: 220 }}>
              {dateInWords(s.a.dateISO)} · {countryOf(s.a.country)[1]}
            </div>
            {days != null && (
              <div style={{
                position: 'absolute', top: 16, right: 0, width: 76, height: 76, borderRadius: '50%',
                border: `1.5px solid ${w.metal}`, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', transform: 'rotate(8deg)',
              }}>
                <span style={{ fontFamily: w.display, fontSize: 24, lineHeight: 1 }}>{days}</span>
                <span style={{ fontSize: 7.5, letterSpacing: '.24em', color: w.ink3, marginTop: 3 }}>DAYS</span>
              </div>
            )}
          </div>
          <Rule w={w} />
          <Eyebrow w={w} color={w.accent}>ACCOUNTS</Eyebrow>
          <div style={{ padding: '10px 0 4px' }}>
            {sections.slice(0, 5).map(([n, v]) => (
              <div key={n} onClick={() => setTab('budget')} style={{ display: 'flex', alignItems: 'baseline', gap: 8, padding: '5px 0', cursor: 'pointer' }}>
                <span style={{ fontSize: 13.5 }}>{n}</span>
                <span style={{ flex: 1, borderBottom: '1.5px dotted #C9B8A0', marginBottom: 3 }} />
                <span style={{ fontFamily: w.display, fontSize: 15 }}>{money(v, cur)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, padding: '7px 0 0', borderTop: `1px solid ${w.rule}`, marginTop: 6 }}>
              <span style={{ fontSize: 13.5, color: w.accent }}>Total planned</span>
              <span style={{ flex: 1, borderBottom: '1.5px dotted #E8C4CE', marginBottom: 3 }} />
              <span style={{ fontFamily: w.display, fontSize: 15, color: w.accent }}>{money(planned, cur)}</span>
            </div>
          </div>
        </>
      );

      if (world === 'linen') return (
        <>
          <WCard w={w} tilt={1.2} style={{ marginTop: 20 }}>
            <div style={{ position: 'absolute', inset: 6, border: '1px solid #E8D9BE', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Display w={w} size={18}>{s.a.n1} &amp; {s.a.n2}</Display>
                <div style={{ fontSize: 9.5, letterSpacing: '.18em', color: w.ink3, marginTop: 3 }}>
                  {dateShort(s.a.dateISO).toUpperCase()} · {countryOf(s.a.country)[1].toUpperCase()}
                </div>
              </div>
              {days != null && (
                <div style={{ background: '#3B2530', color: '#F5D8A8', borderRadius: 8, padding: '7px 11px', transform: 'rotate(3deg)', textAlign: 'center' }}>
                  <div style={{ fontFamily: w.display, fontSize: 19, lineHeight: 1 }}>{days}</div>
                  <div style={{ fontSize: 7, letterSpacing: '.2em', color: '#C9A9B4', marginTop: 2 }}>DAYS</div>
                </div>
              )}
            </div>
          </WCard>
          <div style={{ background: '#F7D9A6', borderRadius: 4, padding: '14px 16px', transform: 'rotate(-2deg)', margin: '20px 0 0', boxShadow: '0 12px 24px rgba(140,100,40,.22)', width: '88%', position: 'relative' }}>
            <span style={{ position: 'absolute', top: -8, left: '38%', width: 50, height: 14, background: 'rgba(255,255,255,.5)', transform: 'rotate(2deg)' }} />
            <Hand w={w} color="#8F5B1E" size={16}>{say('todayLabel', world)} —</Hand>
            <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.45, marginTop: 4, color: '#4A3418' }}>
              {openTask ? openTask.task : 'Nothing pending. Extraordinary.'}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 22 }}>
            {([
              ['guests', '#F3C7D3', '#8E4560', '#4A1F2E', 'GUESTS', String(heads), 'coming'],
              ['budget', '#B8D4C0', '#2E5C42', '#1F3D2C', 'THE PURSE', money(planned, cur), 'planned'],
              ['list', '#A9C4D6', '#28455C', '#16293A', 'TIMELINE', `${doneCount} of ${totalCount}`, 'settled'],
              ['album', '#EADAD5', '#8E7568', '#4A3418', 'THE ALBUM', String(s.photos.length), 'photos'],
            ] as const).map(([t, bg, mid, deep, label, val, sub], ix) => (
              <div key={t} onClick={() => setTab(t as Tab)} style={{
                background: bg, borderRadius: 14, padding: 15, cursor: 'pointer',
                transform: `rotate(${ix % 2 ? 1.4 : -1.6}deg)`, boxShadow: '0 10px 22px rgba(80,80,70,.22)',
              }}>
                <div style={{ fontSize: 9.5, letterSpacing: '.2em', color: mid, fontWeight: 700 }}>{label}</div>
                <div style={{ fontFamily: w.display, fontSize: 21, marginTop: 4, color: deep }}>{val}</div>
                <div style={{ fontSize: 10.5, color: mid, marginTop: 2 }}>{sub}</div>
              </div>
            ))}
          </div>
        </>
      );

      return (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: `2px solid ${w.ink}`, paddingBottom: 10, marginTop: 22 }}>
            <span style={{ fontFamily: w.display, fontSize: 14 }}>MBD</span>
            <span style={{ fontSize: 8.5, letterSpacing: '.3em', color: w.ink3 }}>THE ISSUE</span>
            <span style={{ fontSize: 8.5, letterSpacing: '.2em', color: w.accent, fontWeight: 700 }}>
              {days != null ? `${days} DAYS TO PRESS` : 'UNDATED'}
            </span>
          </div>
          <div style={{ height: 200, marginTop: 16, position: 'relative', overflow: 'hidden', background: 'repeating-linear-gradient(45deg,#EDE6DA,#EDE6DA 7px,#E2D9C9 7px,#E2D9C9 14px)' }}>
            {s.photos[0]
              ? <img src={s.photos[0].src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span onClick={() => setTab('album')} style={{ position: 'absolute', top: 10, left: 12, fontSize: 9, color: w.ink3, background: 'rgba(250,248,243,.85)', padding: '3px 8px', letterSpacing: '.1em', cursor: 'pointer' }}>COVER SHOOT — ADD YOUR PHOTO</span>}
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, background: 'linear-gradient(180deg,transparent,rgba(23,20,26,.78))' }}>
              <div style={{ fontFamily: w.display, fontSize: 27, lineHeight: 1.02, color: '#FAF8F3', textTransform: 'uppercase' }}>
                {s.a.n1}<br />&amp; {s.a.n2}
              </div>
              <div style={{ fontSize: 9, letterSpacing: '.26em', color: '#E2D9C9', marginTop: 7 }}>
                {pack.shortName.toUpperCase()} · {countryOf(s.a.country)[1].toUpperCase()}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 8.5, letterSpacing: '.3em', color: w.ink3, margin: '18px 0 4px' }}>IN THIS ISSUE</div>
          {([
            ['01', 'The brief of the day', openTask ? openTask.task : 'Nothing pending.', 'PRIORITY', 'list'],
            ['02', 'The budget, edited', `${money(planned, cur)} across ${s.plan!.items.filter(i => i.on).length} lines.`, 'p. 04', 'budget'],
            ['03', 'Circulation', `${heads} coming · ${s.guests.length} on the list.`, 'p. 09', 'guests'],
            ['04', 'Object of the day', custom.name, 'p. 11', 'more'],
          ] as const).map(([n, t, d, tag, go]) => (
            <div key={n} onClick={() => setTab(go as Tab)} style={{ display: 'flex', alignItems: 'baseline', gap: 12, padding: '11px 0', borderTop: `1px solid ${w.rule}`, cursor: 'pointer' }}>
              <span style={{ fontFamily: w.display, fontSize: 13, color: w.accent }}>{n}</span>
              <span style={{ flex: 1 }}>
                <span style={{ fontSize: 13.5, fontWeight: 700 }}>{t}</span>
                <span style={{ display: 'block', fontSize: 11.5, fontWeight: 400, color: w.ink2, marginTop: 2 }}>{d}</span>
              </span>
              {tag === 'PRIORITY'
                ? <span style={{ fontSize: 8, letterSpacing: '.18em', color: '#FAF8F3', background: w.accent, padding: '3px 7px', fontWeight: 700 }}>{tag}</span>
                : <span style={{ fontSize: 9.5, color: w.metal }}>{tag}</span>}
            </div>
          ))}
        </>
      );
    };

    /* ── today + custom of the day ────────────────────────────────────── */
    const dailyBlock = (
      <>
        {world !== 'linen' && world !== 'monograph' && (
          <WCard w={w} style={{ marginTop: 16 }} tilt={-1}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Eyebrow w={w} color={w.accent}>{say('todayLabel', world)}</Eyebrow>
              {p.endearment && <Hand w={w} size={13}>then go be in love</Hand>}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.4, marginTop: 6, color: w.ink }}>
              {openTask?.task || 'Nothing pending. Extraordinary.'}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <WButton w={w} style={{ flex: 1, padding: '11px 14px', fontSize: 13 }}
                onClick={() => { if (openTask) { st.tickTask(openTask.id); st.toast('Ticked — that’s the one that unblocks the rest.'); } }}>
                {say('todayDone', world)}
              </WButton>
              <WButton w={w} variant="ghost" style={{ padding: '11px 14px', fontSize: 13 }}
                onClick={() => st.toast('Tomorrow then.')}>{say('todaySnooze', world)}</WButton>
            </div>
          </WCard>
        )}
        <WCard w={w} style={{ marginTop: 14, background: dark ? 'rgba(255,255,255,.05)' : w.surface, border: dark ? '1.5px solid rgba(232,190,110,.5)' : w.edge }} tilt={1}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Eyebrow w={w} color={w.metal}>{say('customLabel', world)}</Eyebrow>
            <span onClick={() => setCustomIx(customIx + 1)} style={{ fontSize: 11, color: dark ? w.ink2Home : w.ink3, textDecoration: 'underline', cursor: 'pointer' }}>
              {say('another', world)}
            </span>
          </div>
          <Display w={w} size={17} style={{ marginTop: 7, color: dark ? w.inkHome : w.ink }}>{custom.name}</Display>
          <div style={{ fontSize: 12.5, lineHeight: 1.55, color: dark ? w.ink2Home : w.ink2, marginTop: 5 }}>{custom.description}</div>
          <div style={{ fontSize: 11, marginTop: 8, color: dark ? w.ink2Home : w.ink3 }}>
            {customIx % pack.customs.length + 1} of {pack.customs.length} in the {pack.shortName} pack
          </div>
        </WCard>
      </>
    );

    /* ── budget ───────────────────────────────────────────────────────── */
    const budget = () => {
      const over = planned - (s.a.budget || 0);
      return (
        <>
          <Display w={w} size={24} style={{ marginTop: 22 }}>{say('budgetTitle', world)}</Display>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            {[['Your budget', money(s.a.budget || 0, cur)], ['Planned', money(planned, cur)], ['Paid', money(paid, cur)]].map(([l, v]) => (
              <div key={l} style={{ flex: 1, border: `1px solid ${w.rule}`, borderRadius: w.radiusSm, padding: '9px 10px' }}>
                <div style={{ fontSize: 8.5, letterSpacing: '.14em', textTransform: 'uppercase', color: w.ink3 }}>{l}</div>
                <div style={{ fontFamily: w.display, fontSize: 15, marginTop: 3 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: over > 0 ? '#B4485A' : '#3E7C5B', marginTop: 8, fontWeight: 600 }}>
            {over > 0 ? `${money(over, cur)} over — trim something or bless it.` : `${money(-over, cur)} of room left.`}
          </div>

          {sections.map(([name, total]) => {
            const open = openSec === name;
            const items = s.plan!.items.filter(i => i.section === name);
            return (
              <div key={name} style={{ marginTop: 14 }}>
                <div onClick={() => setOpenSec(open ? null : name)} style={{
                  display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                  paddingBottom: 6, borderBottom: `1px solid ${w.rule}`, cursor: 'pointer',
                }}>
                  <Display w={w} size={16}>{name}</Display>
                  <span style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{money(total, cur)}</span>
                    <span style={{ fontSize: 12, color: w.ink3 }}>{open ? '–' : '+'}</span>
                  </span>
                </div>
                {open && items.map(i => (
                  <div key={i.id} onClick={() => st.openSheet('item', i.id)} style={{
                    padding: '10px 0', borderBottom: `1px solid ${w.rule}`, cursor: 'pointer', opacity: i.on ? 1 : .45,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, flex: 1, textDecoration: i.on ? 'none' : 'line-through' }}>{i.name}</span>
                      <span style={{ fontFamily: w.display, fontSize: 14 }}>{money(i.agreed ?? i.alloc, cur)}</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: w.ink3, lineHeight: 1.45, marginTop: 3 }}>{i.note}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 7, alignItems: 'center' }}>
                      {i.religious && <span style={{ fontSize: 8.5, letterSpacing: '.1em', fontWeight: 700, padding: '3px 7px', background: '#DFEDE2', color: '#4A7A58' }}>TRADITION</span>}
                      {i.agreed != null && <span style={{ fontSize: 8.5, letterSpacing: '.1em', fontWeight: 700, padding: '3px 7px', background: '#E9F1F8', color: '#4F7590' }}>AGREED</span>}
                      {(s.quotes[i.id] || []).length > 0 && <span style={{ fontSize: 8.5, letterSpacing: '.1em', fontWeight: 700, padding: '3px 7px', background: '#F4EBE7', color: '#8A7580' }}>{s.quotes[i.id].length} QUOTES</span>}
                      <span onClick={e => { e.stopPropagation(); st.openSheet('findme', i.id); }} style={{
                        fontSize: 8.5, letterSpacing: '.1em', fontWeight: 700, padding: '3px 7px', cursor: 'pointer',
                        background: s.unlocked ? '#DFEDE2' : '#F2EAF7', color: s.unlocked ? '#4A7A58' : '#8A5A9E',
                      }}>{s.unlocked ? '' : '✦ '}FIND ME A {(i.supplier || 'SUPPLIER').toUpperCase()}</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
          <WButton w={w} variant="ghost" full style={{ marginTop: 16 }} onClick={() => st.openSheet('addItem')}>
            + Add a line of your own
          </WButton>
          <div style={{ height: 16 }} />
        </>
      );
    };

    /* ── guests ───────────────────────────────────────────────────────── */
    const guests = () => {
      const yes = s.guests.filter(g => g.rsvp === 'yes').length;
      const pend = s.guests.filter(g => g.rsvp === 'pending').length;
      const no = s.guests.filter(g => g.rsvp === 'no').length;
      const diets = s.guests.filter(g => g.diet.trim());
      return (
        <>
          <Display w={w} size={24} style={{ marginTop: 22 }}>{say('guestsTitle', world)}</Display>
          <div style={{ fontSize: 12.5, color: w.ink3, marginTop: 6, lineHeight: 1.5 }}>
            {heads} coming, counting plus-ones · {money(planned / Math.max(1, heads), cur)} a head
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {[['Yes', yes], ['Waiting', pend], ['No', no]].map(([l, n]) => (
              <div key={l as string} style={{ flex: 1, textAlign: 'center', border: `1px solid ${w.rule}`, borderRadius: w.radiusSm, padding: '10px 4px' }}>
                <div style={{ fontFamily: w.display, fontSize: 20 }}>{n as number}</div>
                <div style={{ fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: w.ink3, marginTop: 3 }}>{l as string}</div>
              </div>
            ))}
          </div>

          {!s.guests.length && (
            <WCard w={w} style={{ marginTop: 16 }} tilt={-1}>
              <Hand w={w}>nobody on the list yet</Hand>
              <div style={{ fontSize: 12.5, color: w.ink2, lineHeight: 1.55, marginTop: 6 }}>
                Add them one at a time, or paste the whole lot from your notes app and I’ll sort it.
              </div>
            </WCard>
          )}

          <div style={{ marginTop: 14 }}>
            {s.guests.map(g => (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: `1px solid ${w.rule}` }}>
                <span onClick={() => st.openSheet('guest', g.id)} style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
                  <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600 }}>
                    {g.name}{g.plus ? ` +${g.plus}` : ''}
                  </span>
                  <span style={{ display: 'block', fontSize: 11, color: w.ink3, marginTop: 2 }}>
                    {[g.side === 1 ? s.a.n1 : g.side === 2 ? s.a.n2 : 'Shared', g.diet].filter(Boolean).join(' · ')}
                  </span>
                </span>
                <span onClick={() => st.cycleRSVP(g.id)} style={{
                  fontSize: 11, fontWeight: 700, padding: '5px 11px', borderRadius: w.radiusSm, cursor: 'pointer',
                  background: g.rsvp === 'yes' ? '#E8F3ED' : g.rsvp === 'no' ? '#FAE9EC' : '#F4EBE7',
                  color: g.rsvp === 'yes' ? '#3E7C5B' : g.rsvp === 'no' ? '#B4485A' : '#84717A',
                }}>{g.rsvp === 'yes' ? 'Yes' : g.rsvp === 'no' ? 'No' : '?'}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <WButton w={w} style={{ flex: 1, fontSize: 13 }} onClick={() => st.openSheet('addGuest')}>+ Add a guest</WButton>
            <WButton w={w} variant="ghost" style={{ flex: 1, fontSize: 13 }} onClick={() => st.openSheet('import')}>Paste a list</WButton>
          </div>

          {!!diets.length && (
            <WCard w={w} style={{ marginTop: 14 }} tilt={1}>
              <Eyebrow w={w} color={w.metal}>FOR THE CATERER</Eyebrow>
              {diets.map(g => (
                <div key={g.id} style={{ fontSize: 12, color: w.ink2, marginTop: 6 }}>
                  <b>{g.name}</b> — {g.diet}
                </div>
              ))}
            </WCard>
          )}

          <WCard w={w} style={{ marginTop: 14 }} tilt={-1}>
            <Eyebrow w={w} color={w.metal}>WORTH KNOWING</Eyebrow>
            <div style={{ fontSize: 12.5, lineHeight: 1.55, marginTop: 6, color: w.ink2 }}>{pack.gotchas[1]}</div>
          </WCard>
          <div style={{ height: 16 }} />
        </>
      );
    };

    /* ── timeline ─────────────────────────────────────────────────────── */
    const list = () => (
      <>
        <Display w={w} size={24} style={{ marginTop: 22 }}>{say('listTitle', world)}</Display>
        <div style={{ fontSize: 12.5, color: w.ink3, marginTop: 6 }}>
          {doneCount} of {totalCount} settled · counted back from your date
        </div>
        <div style={{ height: 6, background: w.rule, marginTop: 10, borderRadius: w.radius === '0px' ? 0 : 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.max(2, pct)}%`, background: w.accentGrad }} />
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
          {([['all', 'Everything'], ['tasks', 'Tasks'], ['paper', 'Paperwork'], ['mine', 'Mine']] as const).map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)} style={{
              padding: '7px 12px', borderRadius: w.btnRadius === '0px' ? 0 : 18, cursor: 'pointer',
              fontSize: 11.5, fontWeight: 700, fontFamily: 'inherit',
              border: filter === k ? 'none' : `1.5px solid ${w.rule}`,
              background: filter === k ? w.accentGrad : 'transparent',
              color: filter === k ? w.accentInk : w.ink2,
            }}>{l}</button>
          ))}
        </div>

        {(filter === 'all' || filter === 'tasks') && s.plan!.timeline.map(t => (
          <Row key={t.id} w={w} done={t.done} onClick={() => st.tickTask(t.id)}
            text={t.task} meta={`${t.when}${t.critical ? ' · critical' : ''}`} />
        ))}
        {(filter === 'all' || filter === 'paper') && (
          <>
            <Display w={w} size={17} style={{ marginTop: 18 }}>Paperwork</Display>
            {s.plan!.paperwork.map(pp => (
              <Row key={pp.id} w={w} done={pp.done} onClick={() => st.tickPaper(pp.id)}
                text={pp.item} meta={[pp.who, pp.note].filter(Boolean).join(' · ')} />
            ))}
          </>
        )}
        {(filter === 'all' || filter === 'mine') && (
          <>
            <Display w={w} size={17} style={{ marginTop: 18 }}>Yours</Display>
            {s.todos.map(t => (
              <Row key={t.id} w={w} done={t.done} onClick={() => st.toggleTodo(t.id)}
                text={t.name} meta={t.who} onRemove={() => st.removeTodo(t.id)} />
            ))}
            <WButton w={w} variant="ghost" full style={{ marginTop: 12 }} onClick={() => st.openSheet('addTodo')}>
              + Add something of your own {!s.unlocked && `(${s.todos.length}/${FREE_CUSTOM_CAP})`}
            </WButton>
          </>
        )}
        <div style={{ height: 16 }} />
      </>
    );

    /* ── album ────────────────────────────────────────────────────────── */
    const album = () => (
      <>
        <Display w={w} size={24} style={{ marginTop: 22 }}>{say('albumTitle', world)}</Display>
        <div style={{ fontSize: 12.5, color: w.ink3, marginTop: 6, lineHeight: 1.5 }}>
          One code on every table. Guests scan, shoot, and it lands here while you’re still dancing.
        </div>
        <WCard w={w} style={{ marginTop: 14, textAlign: 'center' }}>
          <div style={{ width: 132, height: 132, margin: '0 auto', background: 'repeating-conic-gradient(#33262B 0% 25%, #fff 0% 50%) 50%/11px 11px', border: `8px solid ${w.surface}`, outline: `1px solid ${w.rule}` }} />
          <div style={{ fontFamily: w.display, fontSize: 16, marginTop: 12 }}>{s.albumCode}</div>
          <div style={{ fontSize: 11, color: w.ink3, marginTop: 2 }}>mybigday.app/album/{s.albumCode}</div>
          {!s.unlocked && (
            <WButton w={w} variant="ghost" full style={{ marginTop: 12, fontSize: 12.5 }}
              onClick={() => st.openSheet('paywall', 'Live guest uploads')}>
              ✦ Go live for guest uploads
            </WButton>
          )}
        </WCard>

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 18 }}>
          <Eyebrow w={w}>YOUR PHOTOS — {s.photos.length}{!s.unlocked && `/${FREE_CUSTOM_CAP}`}</Eyebrow>
          <span onClick={() => fileRef.current?.click()} style={{ fontSize: 11.5, color: w.accent, fontWeight: 700, cursor: 'pointer' }}>+ Add</span>
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
          onChange={e => {
            const files = Array.from(e.target.files || []);
            let blocked = false;
            files.forEach(f => {
              const r = new FileReader();
              r.onload = () => { if (!st.addPhoto(String(r.result), f.name)) blocked = true; };
              r.readAsDataURL(f);
            });
            setTimeout(() => { if (blocked) st.openSheet('paywall', 'Unlimited photos'); }, 300);
            e.target.value = '';
          }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 10 }}>
          {s.photos.map(ph => (
            <div key={ph.id} onClick={() => st.removePhoto(ph.id)} style={{
              aspectRatio: '1', borderRadius: w.radiusSm, overflow: 'hidden', cursor: 'pointer', position: 'relative',
            }}>
              <img src={ph.src} alt={ph.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
          <div onClick={() => fileRef.current?.click()} style={{
            aspectRatio: '1', borderRadius: w.radiusSm, border: `1.5px dashed ${w.accent}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: w.accent, fontSize: 22, cursor: 'pointer',
          }}>+</div>
        </div>
        {!!s.photos.length && <div style={{ fontSize: 11, color: w.ink3, marginTop: 8 }}>Tap a photo to remove it.</div>}
        <div style={{ height: 16 }} />
      </>
    );

    /* ── more ─────────────────────────────────────────────────────────── */
    const more = () => (
      <>
        <Display w={w} size={24} style={{ marginTop: 22 }}>{say('moreTitle', world)}</Display>
        <WCard w={w} style={{ marginTop: 14 }}>
          <Eyebrow w={w} color={w.accent}>YOUR PLANNER</Eyebrow>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 10 }}>
            <span style={{ width: 42, height: 42, borderRadius: '50%', background: p.avatar, color: p.avatarInk, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: w.display, fontSize: 18, flex: 'none' }}>{p.initial}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{p.name}</div>
              <div style={{ fontSize: 10.5, letterSpacing: '.1em', color: w.ink3 }}>{p.title}</div>
            </div>
          </div>
          <div style={{ fontSize: 12.5, color: w.ink2, lineHeight: 1.5, marginTop: 10 }}>{p.pitch}</div>
          <WButton w={w} variant="ghost" full style={{ marginTop: 12 }} onClick={onSwap}>Swap planner</WButton>
        </WCard>

        <div style={{ marginTop: 14 }}>
          {([
            ['The table plan', `${s.tables.length} table${s.tables.length === 1 ? '' : 's'} · ${s.guests.filter(g => s.tables.some(t => t.g.includes(g.id))).length} seated`, 'seating', !s.unlocked],
            ['The run sheet', `${s.plan!.events.length} celebrations, in order`, 'runsheet', !s.unlocked],
            ['Customs & what catches couples out', `${pack.customs.length} explained, in your tradition`, 'traditions', false],
            ['Supplier directory', `Matched to your tradition, near ${countryOf(s.a.country)[1]}`, 'findme', !s.unlocked],
            ['Partner sync', 'Both phones, one plan', 'partner', !s.unlocked],
            ['Export', 'PDF and spreadsheet, for parents and planners', 'export', !s.unlocked],
          ] as const).map(([label, desc, key, locked]) => (
            <div key={label} onClick={() => st.openSheet(key)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0',
              borderTop: `1px solid ${w.rule}`, cursor: 'pointer',
            }}>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600 }}>{label}</span>
                <span style={{ display: 'block', fontSize: 11.5, color: w.ink3, marginTop: 2 }}>{desc}</span>
              </span>
              {locked && <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.08em', padding: '3px 7px', background: '#F2EAF7', color: '#8A5A9E' }}>✦</span>}
            </div>
          ))}
        </div>

        {!s.unlocked && (
          <WCard w={w} style={{ marginTop: 16 }}>
            <Hand w={w} size={17}>the full fantasy…</Hand>
            <Display w={w} size={19} style={{ marginTop: 4 }}>Everything, once, {PRICE}</Display>
            <div style={{ fontSize: 12.5, color: w.ink2, lineHeight: 1.5, marginTop: 6 }}>
              Paid once, kept for good, on both your phones.
            </div>
            <WButton w={w} full style={{ marginTop: 12 }} onClick={() => st.openSheet('paywall')}>Unlock everything</WButton>
          </WCard>
        )}
        <WButton w={w} variant="ghost" full style={{ marginTop: 14 }} onClick={onRestart}>↻ Run the questions again</WButton>
        <div style={{ height: 16 }} />
      </>
    );

    const body = () =>
      tab === 'home' ? <>{home()}{dailyBlock}<div style={{ height: 16 }} /></>
        : tab === 'budget' ? budget()
          : tab === 'guests' ? guests()
            : tab === 'list' ? list()
              : tab === 'album' ? album()
                : more();

    /* ── navigation, four models ─────────────────────────────────────── */
    const nav = () => {
      if (w.nav === 'composer') return (
        <div style={{ flex: 'none', padding: '10px 20px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span onClick={() => setTab(tab === 'home' ? 'more' : 'home')} style={{
            flex: 1, border: '1.5px solid rgba(232,190,110,.55)', borderRadius: 22, padding: '11px 16px',
            fontSize: 13, color: dark ? '#C79BB4' : w.ink3, background: dark ? 'rgba(255,255,255,.06)' : w.surface, cursor: 'pointer',
          }}>{tab === 'home' ? 'spill, babe…' : '← back to the mirror'}</span>
          <span onClick={() => setTab('more')} style={{
            width: 40, height: 40, borderRadius: '50%', flex: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg,#F5D8A8,#D9A855)', color: '#4E1140',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700,
          }}>↑</span>
        </div>
      );
      if (w.nav === 'objects') return (
        <div style={{ flex: 'none', padding: '8px 22px 18px', display: 'flex', justifyContent: 'space-between' }}>
          {([['home', 'table'], ['list', 'the list'], ['album', 'photos'], ['more', 'bits']] as const).map(([t, l]) => (
            <span key={t} onClick={() => setTab(t as Tab)} style={{
              fontFamily: w.hand, fontSize: 16, cursor: 'pointer',
              color: tab === t ? w.accent : w.ink3, textDecoration: tab === t ? 'underline' : 'none',
            }}>{l}</span>
          ))}
        </div>
      );
      const items: [Tab, string][] = w.nav === 'tabs-text'
        ? [['home', 'PLAN'], ['budget', 'ACCOUNTS'], ['guests', 'GUESTS'], ['list', 'WORKS'], ['more', 'MORE']]
        : [['home', 'ISSUE'], ['budget', 'BUDGET'], ['guests', 'GUESTS'], ['album', 'ALBUM'], ['more', 'DESK']];
      return (
        <div style={{
          flex: 'none', display: 'flex', justifyContent: 'space-between', padding: '12px 0 18px',
          borderTop: `${w.nav === 'tabs-rule' ? 2 : 1}px solid ${w.nav === 'tabs-rule' ? w.ink : w.rule}`,
          margin: `0 ${w.gutter}`,
        }}>
          {items.map(([t, l]) => (
            <span key={t} onClick={() => setTab(t)} style={{
              fontSize: 9.5, letterSpacing: '.18em', cursor: 'pointer', fontWeight: tab === t ? 700 : 400,
              color: tab === t ? w.ink : w.ink3,
              borderBottom: tab === t ? `${w.nav === 'tabs-rule' ? 2 : 3}px solid ${w.accent}` : 'none',
              paddingBottom: 3,
            }}>{l}</span>
          ))}
        </div>
      );
    };

    return (
      <Phone w={w} dark={dark}>
        <Sparkles on={world === 'dressing'} />
        <Scroll w={w}>{body()}</Scroll>
        {nav()}
        <Sheets world={world} />
        {st.toastMsg && (
          <div style={{
            position: 'absolute', left: '50%', bottom: 92, transform: 'translateX(-50%)', zIndex: 80,
            background: '#33262B', color: '#fff', fontSize: 12.5, padding: '10px 16px', borderRadius: 20,
            maxWidth: '84%', textAlign: 'center', boxShadow: '0 8px 24px rgba(0,0,0,.25)',
          }}>{st.toastMsg}</div>
        )}
      </Phone>
    );
  };

/* one tickable line, used by every list in the app */
const Row: React.FC<{
  w: ReturnType<typeof useWorld>; done: boolean; text: string; meta?: string;
  onClick: () => void; onRemove?: () => void;
}> = ({ w, done, text, meta, onClick, onRemove }) => (
  <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: '11px 0', borderBottom: `1px solid ${w.rule}` }}>
    <span onClick={onClick} style={{
      width: 22, height: 22, flex: 'none', marginTop: 1, cursor: 'pointer',
      borderRadius: w.radius === '0px' ? 0 : '50%',
      border: `1.5px solid ${done ? '#9BC0A6' : w.accent}`, background: done ? '#9BC0A6' : 'transparent',
      color: '#fff', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>{done ? '✓' : ''}</span>
    <span onClick={onClick} style={{ flex: 1, cursor: 'pointer' }}>
      <span style={{ display: 'block', fontSize: 13, lineHeight: 1.45, textDecoration: done ? 'line-through' : 'none', opacity: done ? .5 : 1 }}>{text}</span>
      {meta && <span style={{ display: 'block', fontSize: 10.5, letterSpacing: '.08em', textTransform: 'uppercase', color: w.ink3, marginTop: 3 }}>{meta}</span>}
    </span>
    {onRemove && <span onClick={onRemove} style={{ color: w.ink3, cursor: 'pointer', fontSize: 15 }}>×</span>}
  </div>
);

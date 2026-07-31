import React from 'react';
import { PACKS } from '@/data/packs';
import { money, countryOf } from '@/engine';
import { useStore, headcount, FREE_TABLE_CAP, FREE_CUSTOM_CAP, PRICE } from '@/store';
import { byId, type WorldId } from '@/world/personas';
import { useWorld, Display, Eyebrow, Hand, WButton } from '@/world/ui';
import type { World } from '@/world/personas';

/* ── the sheet shell, skinned per world ───────────────────────────────── */
export const Sheet: React.FC<{ w: World; title: string; children: React.ReactNode; onClose: () => void }> =
  ({ w, title, children, onClose }) => (
    <>
      <div data-overlay onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(38,22,29,.55)', zIndex: 60,
      }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 61, maxHeight: '86%',
        background: w.surface, color: w.ink,
        borderRadius: w.radius === '0px' ? 0 : '24px 24px 0 0',
        borderTop: w.radius === '0px' ? `2px solid ${w.ink}` : 'none',
        boxShadow: '0 -20px 60px rgba(0,0,0,.3)',
        padding: `18px ${w.gutter} 22px`, overflowY: 'auto',
      }}>
        {w.radius !== '0px' && (
          <div style={{ width: 40, height: 4, borderRadius: 2, background: w.rule, margin: '0 auto 14px' }} />
        )}
        <Display w={w} size={21} style={{ marginBottom: 12 }}>{title}</Display>
        {children}
      </div>
    </>
  );

const Field: React.FC<{ w: World; label: string; children: React.ReactNode }> = ({ w, label, children }) => (
  <div style={{ marginBottom: 10 }}>
    <Eyebrow w={w}>{label}</Eyebrow>
    <div style={{ marginTop: 5 }}>{children}</div>
  </div>
);

const inputStyle = (w: World): React.CSSProperties => ({
  width: '100%', padding: '11px 13px', fontSize: 14, fontFamily: 'inherit',
  border: `1.5px solid ${w.rule}`, borderRadius: w.radiusSm, background: '#fff', color: w.ink,
  outline: 'none',
});

/* Mock directory — the real app proxies Google Places through the Worker. */
const SUPPLIERS: Record<string, { name: string; blurb: string; from: number }[]> = {
  default: [
    { name: 'Aphrodite & Co.', blurb: 'Twelve years on the island. Speaks to the church directly.', from: 1800 },
    { name: 'The Limassol Studio', blurb: 'Shoots the chairetisma properly — knows not to miss the crowns.', from: 2400 },
    { name: 'Meraki Events', blurb: 'Handles the standing capacity question before you ask it.', from: 1200 },
  ],
};

export const Sheets: React.FC<{ world: WorldId }> = ({ world }) => {
  const w = useWorld(world), p = byId(world);
  const st = useStore();
  const { s, sheet, sheetArg, closeSheet } = st;
  if (!sheet || !s.plan) return null;

  const pack = PACKS[s.a.packId!];
  const cur = countryOf(s.a.country)[2];
  const item = sheetArg ? s.plan.items.find(i => i.id === sheetArg) : null;
  const close = closeSheet;

  /* ── add a budget line ───────────────────────────────────────────── */
  if (sheet === 'addItem') {
    const custom = s.plan.items.filter(i => i.id.startsWith('c')).length;
    const capped = !s.unlocked && custom >= FREE_CUSTOM_CAP;
    return (
      <Sheet w={w} title="Add to the plan" onClose={close}>
        {capped ? (
          <>
            <div style={{ fontSize: 13, lineHeight: 1.6, color: w.ink2 }}>
              That’s {FREE_CUSTOM_CAP} of your own lines — the limit on the free plan. The unlock removes it.
            </div>
            <WButton w={w} full style={{ marginTop: 12 }} onClick={() => st.openSheet('paywall', 'Unlimited custom lines')}>
              See the unlock
            </WButton>
          </>
        ) : (
          <form onSubmit={e => {
            e.preventDefault();
            const f = e.target as HTMLFormElement;
            const name = (f.elements.namedItem('n') as HTMLInputElement).value.trim();
            const sec = (f.elements.namedItem('s') as HTMLSelectElement).value;
            const amt = parseInt((f.elements.namedItem('a') as HTMLInputElement).value.replace(/\D/g, ''), 10) || 0;
            if (!name) return;
            st.addCustomItem(name, sec, amt);
            st.toast('Added to the plan');
            close();
          }}>
            <Field w={w} label="What is it?">
              <input name="n" autoFocus placeholder="e.g. Grandmother’s corsage" style={inputStyle(w)} />
            </Field>
            <Field w={w} label="Where does it belong?">
              <select name="s" style={inputStyle(w)} defaultValue="Extras">
                {['Ceremony', 'Reception', 'Attire', 'Flowers & Styling', 'Photos & Film',
                  'Music & Entertainment', 'Stationery', 'Transport', 'Rings & Gifts', 'Beauty', 'Extras']
                  .map(x => <option key={x}>{x}</option>)}
              </select>
            </Field>
            <Field w={w} label={`Rough cost (${cur})`}>
              <input name="a" inputMode="numeric" placeholder="0" style={inputStyle(w)} />
            </Field>
            <WButton w={w} full style={{ marginTop: 6 }}>Add it</WButton>
          </form>
        )}
      </Sheet>
    );
  }

  /* ── one budget line, in full: price, paid, deposit, quotes ──────── */
  if (sheet === 'item' && item) {
    const quotes = s.quotes[item.id] || [];
    return (
      <Sheet w={w} title={item.name} onClose={close}>
        <div style={{ fontSize: 12.5, color: w.ink2, lineHeight: 1.55, marginBottom: 12 }}>{item.note}</div>

        <Field w={w} label={`Agreed price (${cur})`}>
          <input inputMode="numeric" defaultValue={item.agreed ?? ''} placeholder={String(item.alloc)}
            onChange={e => st.setItem(item.id, { agreed: parseInt(e.target.value.replace(/\D/g, ''), 10) || null })}
            style={inputStyle(w)} />
        </Field>
        <Field w={w} label={`Paid so far (${cur})`}>
          <input inputMode="numeric" defaultValue={item.paid || ''}
            onChange={e => st.setItem(item.id, { paid: parseInt(e.target.value.replace(/\D/g, ''), 10) || 0 })}
            style={inputStyle(w)} />
        </Field>

        <div style={{ marginTop: 6, paddingTop: 12, borderTop: `1px solid ${w.rule}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Eyebrow w={w}>QUOTES</Eyebrow>
            {!s.unlocked && <span style={{ fontSize: 10, color: '#8A5A9E', fontWeight: 700 }}>✦ scanning is in the unlock</span>}
          </div>
          {quotes.map(q => (
            <div key={q.id} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0',
              borderBottom: `1px solid ${w.rule}`,
            }}>
              <span onClick={() => st.chooseQuote(item.id, q.id)} style={{
                width: 18, height: 18, flex: 'none', borderRadius: '50%', cursor: 'pointer',
                border: `1.5px solid ${q.chosen ? '#3E7C5B' : w.rule}`,
                background: q.chosen ? '#9BC0A6' : 'transparent',
              }} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 600 }}>{q.supplier}</span>
                {q.note && <span style={{ display: 'block', fontSize: 11, color: w.ink3 }}>{q.note}</span>}
              </span>
              <span style={{ fontFamily: w.display, fontSize: 14 }}>{money(q.amt, cur)}</span>
              <span onClick={() => st.removeQuote(item.id, q.id)} style={{ fontSize: 14, color: w.ink3, cursor: 'pointer' }}>×</span>
            </div>
          ))}
          <form style={{ display: 'flex', gap: 6, marginTop: 10 }} onSubmit={e => {
            e.preventDefault();
            const f = e.target as HTMLFormElement;
            const sup = (f.elements.namedItem('sup') as HTMLInputElement);
            const amt = (f.elements.namedItem('amt') as HTMLInputElement);
            if (!sup.value.trim()) return;
            st.addQuote(item.id, sup.value.trim(), parseInt(amt.value.replace(/\D/g, ''), 10) || 0, '');
            sup.value = ''; amt.value = '';
          }}>
            <input name="sup" placeholder="Supplier" style={{ ...inputStyle(w), flex: 2 }} />
            <input name="amt" inputMode="numeric" placeholder={cur} style={{ ...inputStyle(w), flex: 1 }} />
            <WButton w={w} style={{ padding: '10px 14px', fontSize: 12 }}>Add</WButton>
          </form>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <WButton w={w} variant="ghost" style={{ flex: 1, fontSize: 12.5 }}
            onClick={() => st.openSheet('findme', item.id)}>
            {s.unlocked ? '' : '✦ '}Find me a {item.supplier || 'supplier'}
          </WButton>
          <WButton w={w} variant="ghost" style={{ fontSize: 12.5 }}
            onClick={() => { st.toggleItem(item.id); close(); st.toast(item.on ? 'Taken out of the plan' : 'Back in the plan'); }}>
            {item.on ? 'Remove' : 'Put back'}
          </WButton>
        </div>
      </Sheet>
    );
  }

  /* ── find me a supplier — locked on the free plan ─────────────────── */
  if (sheet === 'findme') {
    const cat = item?.supplier || 'supplier';
    if (!s.unlocked) {
      return (
        <Sheet w={w} title={`Find me a ${cat}`} onClose={close}>
          <div style={{ fontSize: 13, lineHeight: 1.6, color: w.ink2 }}>
            Matched to your tradition and near {countryOf(s.a.country)[1]} — with one-tap enquiries that go out in your name.
            It’s part of the unlock.
          </div>
          <WButton w={w} full style={{ marginTop: 14 }} onClick={() => st.openSheet('paywall', `Find me a ${cat}`)}>
            See what’s in it
          </WButton>
        </Sheet>
      );
    }
    return (
      <Sheet w={w} title={`${cat}s near ${countryOf(s.a.country)[1]}`} onClose={close}>
        {SUPPLIERS.default.map(x => (
          <div key={x.name} style={{ padding: '11px 0', borderBottom: `1px solid ${w.rule}` }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{x.name}</span>
              <span style={{ fontSize: 12, color: w.ink3 }}>from {money(x.from, cur)}</span>
            </div>
            <div style={{ fontSize: 12, color: w.ink2, lineHeight: 1.5, marginTop: 3 }}>{x.blurb}</div>
            <WButton w={w} variant="ghost" style={{ marginTop: 8, fontSize: 12, padding: '8px 14px' }}
              onClick={() => st.openSheet('enquiry', x.name)}>Message them</WButton>
          </div>
        ))}
      </Sheet>
    );
  }

  /* ── the enquiry composer ─────────────────────────────────────────── */
  if (sheet === 'enquiry') {
    const draft = `Hello ${sheetArg},\n\nWe're ${s.a.n1} and ${s.a.n2}, marrying in ${countryOf(s.a.country)[1]}${s.a.dateISO ? ' on ' + new Date(s.a.dateISO).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}. It's a ${pack.shortName} wedding, around ${headcount(s.guests) || s.a.guests} guests.\n\nAre you free that day, and could you send a quote?\n\nThank you,\n${s.a.n1} & ${s.a.n2}`;
    return (
      <Sheet w={w} title={`Message ${sheetArg}`} onClose={close}>
        <Hand w={w} size={15}>{p.first} drafted this — change anything.</Hand>
        <textarea defaultValue={draft} rows={11}
          style={{ ...inputStyle(w), marginTop: 10, lineHeight: 1.55, resize: 'vertical' }} />
        <WButton w={w} full style={{ marginTop: 10 }}
          onClick={() => { close(); st.toast('Sent. I’ll chase them if they go quiet.'); }}>
          Send it
        </WButton>
      </Sheet>
    );
  }

  /* ── guests: add / paste import / edit ────────────────────────────── */
  if (sheet === 'addGuest') return (
    <Sheet w={w} title="Add a guest" onClose={close}>
      <form onSubmit={e => {
        e.preventDefault();
        const f = e.target as HTMLFormElement;
        const n = (f.elements.namedItem('n') as HTMLInputElement);
        if (!n.value.trim()) return;
        st.addGuest(n.value.trim()); n.value = ''; st.toast('Added');
      }}>
        <Field w={w} label="Name"><input name="n" autoFocus placeholder="e.g. Yiayia Eleni" style={inputStyle(w)} /></Field>
        <WButton w={w} full>Add</WButton>
      </form>
      <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${w.rule}` }}>
        <WButton w={w} variant="ghost" full onClick={() => st.openSheet('import')}>Paste a whole list instead</WButton>
      </div>
    </Sheet>
  );

  if (sheet === 'import') return (
    <Sheet w={w} title="Paste your list" onClose={close}>
      <div style={{ fontSize: 12.5, color: w.ink2, lineHeight: 1.55 }}>
        One per line. Add a dietary note or <b>+2</b> after a comma and I’ll pick it up.
      </div>
      <form onSubmit={e => {
        e.preventDefault();
        const t = ((e.target as HTMLFormElement).elements.namedItem('t') as HTMLTextAreaElement).value;
        const n = st.importGuests(t);
        close(); st.toast(n ? `${n} added` : 'Nothing to add');
      }}>
        <textarea name="t" rows={8} autoFocus
          placeholder={'Eleni Christofi, gluten free\nKyriakos Papadopoulos, +2\nThe Georgiou family'}
          style={{ ...inputStyle(w), marginTop: 10, lineHeight: 1.6, resize: 'vertical' }} />
        <WButton w={w} full style={{ marginTop: 10 }}>Import them</WButton>
      </form>
    </Sheet>
  );

  if (sheet === 'guest') {
    const g = s.guests.find(x => x.id === sheetArg);
    if (!g) return null;
    return (
      <Sheet w={w} title={g.name} onClose={close}>
        <Field w={w} label="Name">
          <input defaultValue={g.name} onChange={e => st.updateGuest(g.id, { name: e.target.value })} style={inputStyle(w)} />
        </Field>
        <Field w={w} label="Dietary needs">
          <input defaultValue={g.diet} placeholder="none" onChange={e => st.updateGuest(g.id, { diet: e.target.value })} style={inputStyle(w)} />
        </Field>
        <Field w={w} label="Plus ones">
          <div style={{ display: 'flex', gap: 6 }}>
            {[0, 1, 2, 3].map(n => (
              <WButton key={n} w={w} variant={g.plus === n ? 'primary' : 'ghost'}
                style={{ flex: 1, padding: '9px 0', fontSize: 13 }}
                onClick={() => st.updateGuest(g.id, { plus: n })}>+{n}</WButton>
            ))}
          </div>
        </Field>
        <Field w={w} label="Whose side">
          <div style={{ display: 'flex', gap: 6 }}>
            {([[0, 'Shared'], [1, s.a.n1 || 'One'], [2, s.a.n2 || 'Other']] as const).map(([v, l]) => (
              <WButton key={v} w={w} variant={g.side === v ? 'primary' : 'ghost'}
                style={{ flex: 1, padding: '9px 0', fontSize: 12 }}
                onClick={() => st.updateGuest(g.id, { side: v as 0 | 1 | 2 })}>{l}</WButton>
            ))}
          </div>
        </Field>
        <WButton w={w} variant="ghost" full style={{ marginTop: 8 }}
          onClick={() => { st.removeGuest(g.id); close(); st.toast('Removed'); }}>Remove from the list</WButton>
      </Sheet>
    );
  }

  /* ── the table plan ───────────────────────────────────────────────── */
  if (sheet === 'seating') {
    const seated = new Set(s.tables.flatMap(t => t.g));
    const unassigned = s.guests.filter(g => g.rsvp !== 'no' && !seated.has(g.id));
    return (
      <Sheet w={w} title="The table plan" onClose={close}>
        {s.tables.map(t => (
          <div key={t.id} style={{ border: `1px solid ${w.rule}`, borderRadius: w.radiusSm, padding: 12, marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input defaultValue={t.name} onChange={e => st.set({
                tables: s.tables.map(x => (x.id === t.id ? { ...x, name: e.target.value } : x)),
              })} style={{ ...inputStyle(w), flex: 1, padding: '6px 9px', fontSize: 13, fontWeight: 700 }} />
              <span style={{ fontSize: 11.5, color: w.ink3 }}>{t.g.length}/{t.seats}</span>
              <span onClick={() => st.removeTable(t.id)} style={{ cursor: 'pointer', color: w.ink3 }}>×</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
              {t.g.map(gid => {
                const g = s.guests.find(x => x.id === gid);
                return g ? (
                  <span key={gid} onClick={() => st.unseat(gid)} style={{
                    fontSize: 11.5, padding: '5px 9px', borderRadius: w.radiusSm, cursor: 'pointer',
                    background: '#E8F3ED', color: '#3E7C5B',
                  }}>{g.name} ×</span>
                ) : null;
              })}
              {!t.g.length && <span style={{ fontSize: 11.5, color: w.ink3 }}>Empty — tap a name below.</span>}
            </div>
          </div>
        ))}

        <WButton w={w} variant="ghost" full onClick={() => {
          if (!st.addTable()) st.openSheet('paywall', 'Unlimited tables');
        }}>
          + Add a table {!s.unlocked && `(${s.tables.length}/${FREE_TABLE_CAP} free)`}
        </WButton>

        {!!unassigned.length && !!s.tables.length && (
          <div style={{ marginTop: 14 }}>
            <Eyebrow w={w}>STILL TO SEAT — {unassigned.length}</Eyebrow>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
              {unassigned.map(g => (
                <span key={g.id} onClick={() => st.seat(s.tables[s.tables.length - 1].id, g.id)} style={{
                  fontSize: 11.5, padding: '5px 9px', borderRadius: w.radiusSm, cursor: 'pointer',
                  border: `1px solid ${w.rule}`,
                }}>{g.name}</span>
              ))}
            </div>
            <div style={{ fontSize: 11, color: w.ink3, marginTop: 7 }}>Tap a name to seat them at the last table.</div>
          </div>
        )}
      </Sheet>
    );
  }

  /* ── run sheet, built from the events they kept ───────────────────── */
  if (sheet === 'runsheet') return (
    <Sheet w={w} title="The run sheet" onClose={close}>
      {s.plan.events.map((e, ix) => (
        <div key={e.id} style={{ padding: '11px 0', borderBottom: `1px solid ${w.rule}` }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontFamily: w.display, fontSize: 13, color: w.accent, minWidth: 22 }}>
              {String(ix + 1).padStart(2, '0')}
            </span>
            <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>{e.name}</span>
          </div>
          <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: w.ink3, marginLeft: 32, marginTop: 2 }}>{e.when}</div>
          {e.description && <div style={{ fontSize: 12, color: w.ink2, lineHeight: 1.5, marginLeft: 32, marginTop: 4 }}>{e.description}</div>}
        </div>
      ))}
      {!s.unlocked && (
        <WButton w={w} full style={{ marginTop: 12 }} onClick={() => st.openSheet('paywall', 'Run sheet editing & printing')}>
          ✦ Edit and print it
        </WButton>
      )}
    </Sheet>
  );

  /* ── traditions and what catches couples out ──────────────────────── */
  if (sheet === 'traditions') return (
    <Sheet w={w} title={`${pack.shortName} — customs`} onClose={close}>
      {pack.customs.map(c => (
        <div key={c.name} style={{ padding: '11px 0', borderBottom: `1px solid ${w.rule}` }}>
          <Display w={w} size={16}>{c.name}</Display>
          <div style={{ fontSize: 12.5, color: w.ink2, lineHeight: 1.55, marginTop: 4 }}>{c.description}</div>
        </div>
      ))}
      <Display w={w} size={18} style={{ margin: '18px 0 6px' }}>What catches couples out</Display>
      {pack.gotchas.map((g, k) => (
        <div key={k} style={{ fontSize: 12.5, color: w.ink2, lineHeight: 1.55, padding: '9px 0', borderTop: `1px solid ${w.rule}` }}>{g}</div>
      ))}
    </Sheet>
  );

  /* ── export ───────────────────────────────────────────────────────── */
  if (sheet === 'export') return (
    <Sheet w={w} title="Export" onClose={close}>
      {!s.unlocked ? (
        <>
          <div style={{ fontSize: 13, color: w.ink2, lineHeight: 1.6 }}>
            A PDF for the parents and a spreadsheet for you — both in the unlock.
          </div>
          <WButton w={w} full style={{ marginTop: 14 }} onClick={() => st.openSheet('paywall', 'PDF & spreadsheet export')}>
            See what’s in it
          </WButton>
        </>
      ) : (
        <>
          {['The whole plan, as a PDF', 'Budget as a spreadsheet', 'Guest list as a spreadsheet', 'Run sheet for suppliers'].map(x => (
            <WButton key={x} w={w} variant="ghost" full style={{ marginBottom: 8, fontSize: 13 }}
              onClick={() => { close(); st.toast('Exported'); }}>{x}</WButton>
          ))}
        </>
      )}
    </Sheet>
  );

  /* ── partner sync ─────────────────────────────────────────────────── */
  if (sheet === 'partner') return (
    <Sheet w={w} title="Partner sync" onClose={close}>
      <div style={{ fontSize: 13, color: w.ink2, lineHeight: 1.6 }}>
        One plan, both phones, every change everywhere — and backed up while we’re at it.
      </div>
      {s.unlocked ? (
        <div style={{ marginTop: 14, padding: 14, border: `1px solid ${w.rule}`, borderRadius: w.radiusSm, textAlign: 'center' }}>
          <Eyebrow w={w}>YOUR PAIRING CODE</Eyebrow>
          <div style={{ fontFamily: w.display, fontSize: 30, letterSpacing: '.2em', marginTop: 6 }}>55Z6UW</div>
          <div style={{ fontSize: 11.5, color: w.ink3, marginTop: 6 }}>
            {s.a.n2 || 'Your partner'} taps “I have a code” and types it in.
          </div>
        </div>
      ) : (
        <WButton w={w} full style={{ marginTop: 14 }} onClick={() => st.openSheet('paywall', 'Partner sync')}>
          ✦ Turn on sync
        </WButton>
      )}
    </Sheet>
  );

  /* ── the paywall ──────────────────────────────────────────────────── */
  if (sheet === 'paywall') return (
    <Sheet w={w} title="Everything, once." onClose={close}>
      <Hand w={w} size={17}>the full fantasy…</Hand>
      <div style={{ fontSize: 12.5, color: w.ink2, lineHeight: 1.55, margin: '8px 0 12px' }}>
        {sheetArg ? `You tapped ${sheetArg} — it’s in here.` : 'One payment, no subscription, no catch.'}
      </div>
      {['Supplier matching near you, with one-tap enquiries',
        'Point the camera at a quote — it files itself',
        'Deposits tracked, balances chased, nothing missed',
        'A run sheet to hand every supplier',
        'Seating plans without limits',
        'The guest album, live on the night',
        'Exports for the parents and the planner',
        'Two phones, one plan, always in step'].map(f => (
          <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '7px 0', borderTop: `1px solid ${w.rule}` }}>
            <span style={{ width: 16, height: 16, borderRadius: '50%', flex: 'none', marginTop: 2, background: w.accentGrad }} />
            <span style={{ flex: 1, fontSize: 13, lineHeight: 1.45 }}>{f}</span>
          </div>
        ))}
      <div style={{ fontFamily: w.display, fontSize: 34, textAlign: 'center', margin: '18px 0 2px' }}>{PRICE}</div>
      <div style={{ textAlign: 'center', fontSize: 12, color: w.ink3, marginBottom: 14 }}>Paid once, never again. Yours for good.</div>
      <WButton w={w} full onClick={st.unlock}>Unlock everything</WButton>
      <WButton w={w} variant="ghost" full style={{ marginTop: 8 }} onClick={close}>Not now</WButton>
    </Sheet>
  );

  /* ── add a to-do of your own ──────────────────────────────────────── */
  if (sheet === 'addTodo') return (
    <Sheet w={w} title="Add a to-do" onClose={close}>
      <form onSubmit={e => {
        e.preventDefault();
        const f = e.target as HTMLFormElement;
        const n = (f.elements.namedItem('n') as HTMLInputElement).value.trim();
        const who = (f.elements.namedItem('who') as HTMLSelectElement).value;
        if (!n) return;
        if (!st.addTodo(n, who)) { st.openSheet('paywall', 'Unlimited to-dos'); return; }
        close(); st.toast('On the list');
      }}>
        <Field w={w} label="What needs doing?">
          <input name="n" autoFocus placeholder="e.g. Ask Uncle Tak to read" style={inputStyle(w)} />
        </Field>
        <Field w={w} label="Who’s doing it?">
          <select name="who" style={inputStyle(w)} defaultValue="Us">
            {['Us', s.a.n1 || 'One of us', s.a.n2 || 'The other', 'Family', p.first].map(x => <option key={x}>{x}</option>)}
          </select>
        </Field>
        <WButton w={w} full>Add it</WButton>
      </form>
    </Sheet>
  );

  return null;
};

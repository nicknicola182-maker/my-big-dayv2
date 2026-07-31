import React from 'react';
import { WORLDS, type WorldId, type World } from './personas';

export const useWorld = (id: WorldId): World => WORLDS[id];

/* ── type ──────────────────────────────────────────────────────────────── */

export const Display: React.FC<{ w: World; size?: number; children: React.ReactNode; style?: React.CSSProperties }> =
  ({ w, size = 30, children, style }) => (
    <div style={{
      fontFamily: w.display, fontSize: size, lineHeight: 1.1, letterSpacing: w.displayTrack,
      textTransform: w.displayCase, whiteSpace: 'pre-line', ...style,
    }}>{children}</div>
  );

export const Eyebrow: React.FC<{ w: World; children: React.ReactNode; color?: string; style?: React.CSSProperties }> =
  ({ w, children, color, style }) => (
    <div style={{
      fontSize: 9.5, letterSpacing: '.28em', textTransform: 'uppercase', fontWeight: 700,
      color: color || w.ink3, ...style,
    }}>{children}</div>
  );

/* Ziggy, Anneke and Rosie get real handwriting. Perdita gets letter-spaced caps —
   she does not do handwritten asides, and the token makes that automatic. */
export const Hand: React.FC<{ w: World; children: React.ReactNode; color?: string; size?: number }> =
  ({ w, children, color, size = 17 }) => (
    <div style={{
      fontFamily: w.hand, textTransform: w.handCase, letterSpacing: w.handTrack,
      fontSize: w.handCase === 'uppercase' ? size * 0.62 : size,
      fontWeight: w.handCase === 'uppercase' ? 700 : 400,
      color: color || w.accent, lineHeight: 1.35,
    }}>{children}</div>
  );

/* ── card: the highest-leverage primitive, one per world ───────────────── */

export const WCard: React.FC<{
  w: World; children: React.ReactNode; tilt?: number; tape?: boolean;
  style?: React.CSSProperties; onClick?: () => void; pad?: number;
}> = ({ w, children, tilt = 0, tape, style, onClick, pad = 16 }) => {
  const rot = w.rotate ? (tilt || 0) : 0;
  return (
    <div onClick={onClick} style={{
      background: w.surface, borderRadius: w.radius, border: w.edge, boxShadow: w.shadow,
      padding: pad, position: 'relative', transform: rot ? `rotate(${rot}deg)` : undefined,
      cursor: onClick ? 'pointer' : undefined, ...style,
    }}>
      {tape && w.rotate ? (
        <span style={{
          position: 'absolute', top: -8, left: '32%', width: 52, height: 15,
          background: 'rgba(233,214,180,.8)', transform: 'rotate(-3deg)',
        }} />
      ) : null}
      {children}
    </div>
  );
};

/* ── button ────────────────────────────────────────────────────────────── */

export const WButton: React.FC<{
  w: World; children: React.ReactNode; onClick?: () => void; disabled?: boolean;
  variant?: 'primary' | 'ghost'; style?: React.CSSProperties; full?: boolean;
}> = ({ w, children, onClick, disabled, variant = 'primary', style, full }) => {
  const primary = variant === 'primary';
  const gold = w.nav === 'composer' && primary;   // Ziggy's CTAs are gold foil
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: full ? '100%' : undefined,
      padding: '15px 22px', border: primary ? 'none' : `1.5px solid ${w.rule}`,
      borderRadius: w.btnRadius, cursor: disabled ? 'default' : 'pointer',
      fontFamily: 'Outfit, system-ui, sans-serif', fontSize: 14.5, fontWeight: 700,
      letterSpacing: w.btnTrack,
      textTransform: w.btnTrack === '.24em' || w.btnTrack === '.26em' ? 'uppercase' : 'none',
      background: primary ? (gold ? 'linear-gradient(135deg,#F5D8A8 0%,#E8BE6E 45%,#D9A855 100%)' : w.accentGrad) : 'transparent',
      color: primary ? (gold ? '#4E1140' : w.accentInk) : w.ink2,
      opacity: disabled ? 0.35 : 1,
      boxShadow: primary && gold ? '0 10px 26px rgba(217,168,85,.45)' : 'none',
      transition: 'opacity .15s', ...style,
    }}>{children}</button>
  );
};

/* ── option row: four genuinely different answer models ────────────────── */

export const Option: React.FC<{
  w: World; on: boolean; index: number; label: string; desc?: string; onClick: () => void;
}> = ({ w, on, index, label, desc, onClick }) => {
  /* Anneke — a ledger line: number, rule, no box */
  if (w.nav === 'tabs-text') return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 16, padding: '14px 2px',
      borderBottom: `1px solid ${w.rule}`, cursor: 'pointer',
    }}>
      <span style={{
        width: 30, height: 30, borderRadius: '50%', flex: 'none', display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700,
        border: on ? `1.5px solid ${w.accent}` : 'none', color: on ? w.accent : '#B8A894',
      }}>{String(index + 1).padStart(2, '0')}</span>
      <span style={{ flex: 1, fontFamily: w.display, fontSize: 18, color: on ? w.accent : w.ink }}>{label}</span>
      {on && <Hand w={w} size={15}>noted ✓</Hand>}
    </div>
  );

  /* Perdita — a contents entry: hairline, halftone chip, page reference */
  if (w.nav === 'tabs-rule') return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0',
      borderTop: `1px solid ${w.rule}`, cursor: 'pointer',
    }}>
      <span style={{
        width: 34, height: 24, flex: 'none',
        background: 'repeating-linear-gradient(45deg,#EDE6DA,#EDE6DA 4px,#E2D9C9 4px,#E2D9C9 8px)',
      }} />
      <span style={{
        flex: 1, fontSize: 14, letterSpacing: '.02em', textTransform: 'uppercase',
        fontWeight: on ? 700 : 400, color: on ? w.ink : w.ink2,
      }}>{label}</span>
      {on
        ? <span style={{ fontSize: 8.5, letterSpacing: '.22em', color: w.accent, fontWeight: 700, borderBottom: `2px solid ${w.accent}`, paddingBottom: 2 }}>CONFIRMED</span>
        : <span style={{ fontSize: 10, color: w.metal }}>p. {12 + index * 2}</span>}
    </div>
  );

  /* Rosie — a swatch card off the table, tilted */
  if (w.nav === 'objects') return (
    <div onClick={onClick} style={{
      background: on ? '#E79BB3' : w.surface, color: on ? '#4A1F2E' : w.ink,
      borderRadius: w.radius, padding: '14px 16px', cursor: 'pointer',
      border: on ? 'none' : `1px solid ${w.rule}`,
      boxShadow: on ? '0 12px 26px rgba(160,70,100,.3)' : '0 6px 16px rgba(60,40,30,.1)',
      transform: `rotate(${(index % 2 ? 1 : -1) * 1.4}deg)`, position: 'relative',
    }}>
      {on && <span style={{
        position: 'absolute', top: -7, left: '50%', width: 13, height: 13, borderRadius: '50%',
        background: '#C9587A', transform: 'translateX(-50%)', boxShadow: '0 3px 6px rgba(0,0,0,.25)',
      }} />}
      <div style={{ fontFamily: w.display, fontSize: 19 }}>{label}</div>
      {desc && <div style={{ fontSize: 11.5, marginTop: 3, opacity: .75 }}>{desc}</div>}
    </div>
  );

  /* Ziggy — set into the gold vanity mirror */
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '13px 15px',
      borderRadius: on ? w.radiusSm : 0, cursor: 'pointer',
      borderTop: index === 0 ? 'none' : `1px solid ${w.rule}`,
      background: on ? w.accentGrad : 'transparent',
      color: on ? '#fff' : w.ink2,
      boxShadow: on ? '0 8px 20px rgba(182,45,119,.35), 0 0 0 1.5px rgba(232,190,110,.55)' : 'none',
    }}>
      <span style={{ flex: 1, fontSize: 14.5, fontWeight: on ? 700 : 600 }}>{label}</span>
      <span style={{ fontSize: 13, color: on ? '#fff' : '#D4438C' }}>{on ? '✨' : '›'}</span>
    </div>
  );
};

/* ── progress: four metaphors, one live count ──────────────────────────── */

export const Progress: React.FC<{ w: World; i: number; total: number }> = ({ w, i, total }) => {
  if (w.progress === 'bulbs') return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
      {Array.from({ length: total }, (_, k) => (
        <span key={k} style={{
          width: k === i ? 9 : 6, height: k === i ? 9 : 6, borderRadius: '50%',
          background: k <= i ? 'radial-gradient(circle at 35% 35%,#FBE7BE,#E8BE6E)' : '#EBD9DF',
          boxShadow: k <= i ? '0 0 8px rgba(232,190,110,.9)' : 'none',
        }} />
      ))}
    </div>
  );
  if (w.progress === 'roman') return (
    <span style={{ fontFamily: w.display, fontSize: 13, color: w.metal }}>
      {['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][i + 1]} / {['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][total]}
    </span>
  );
  if (w.progress === 'numero') return (
    <span style={{ fontSize: 9, letterSpacing: '.2em', color: w.accent, fontWeight: 700 }}>
      № {String(i + 1).padStart(2, '0')} / {total}
    </span>
  );
  return (
    <div style={{
      height: 30, background: '#C9587A', borderRadius: 6, display: 'flex',
      alignItems: 'center', justifyContent: 'space-between', padding: '0 14px',
      boxShadow: '0 8px 20px rgba(172,63,99,.32)',
    }}>
      <span style={{ display: 'flex', gap: 4 }}>
        {Array.from({ length: total }, (_, k) => (
          <span key={k} style={{ width: 8, height: 2, background: k <= i ? '#F6DDE2' : 'rgba(255,255,255,.35)' }} />
        ))}
      </span>
      <span style={{ color: '#fff', fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em' }}>
        STITCH {i + 1} OF {total}
      </span>
    </div>
  );
};

/* ── phone shell ───────────────────────────────────────────────────────── */

export const Phone: React.FC<{ w: World; dark?: boolean; children: React.ReactNode }> =
  ({ w, dark, children }) => (
    <div style={{
      width: 390, height: 800, borderRadius: 30, overflow: 'hidden', position: 'relative',
      /* One value, not `background` + `backgroundImage: undefined` — the shorthand sets
         background-image, so clearing it afterwards wipes the gradient. */
      background: dark ? w.canvasHome : (w.texture !== 'none' ? w.texture : w.canvas),
      color: dark ? w.inkHome : w.ink,
      fontFamily: 'Outfit, system-ui, sans-serif',
      display: 'flex', flexDirection: 'column',
      boxShadow: dark
        ? '0 24px 60px rgba(40,10,38,.4), 0 0 0 1.5px rgba(232,190,110,.5)'
        : '0 24px 60px rgba(60,40,48,.18)',
    }}>{children}</div>
  );

export const Scroll: React.FC<{ w: World; children: React.ReactNode; style?: React.CSSProperties }> =
  ({ w, children, style }) => (
    <div style={{
      flex: 1, minHeight: 0, overflowY: 'auto', padding: `0 ${w.gutter}`,
      scrollbarWidth: 'thin', ...style,
    }}>{children}</div>
  );

/* Ziggy's sparkle layer. Gated per world — Anneke and Perdita get nothing. */
export const Sparkles: React.FC<{ on: boolean }> = ({ on }) => on ? (
  <>
    {[['9%', '18%', 5, 0], ['86%', '24%', 4, 1.3], ['16%', '68%', 4, 2.4], ['80%', '58%', 5, .7]]
      .map(([l, t, s, d], k) => (
        <span key={k} style={{
          position: 'absolute', left: l as string, top: t as string,
          width: s as number, height: s as number, borderRadius: '50%',
          background: k % 2 ? '#E783B8' : '#F3C97E', zIndex: 5, pointerEvents: 'none',
          animation: `mbdSpark 3.8s ease-in-out ${d}s infinite`,
        }} />
      ))}
  </>
) : null;

/* Ziggy's marquee bulb row */
export const Bulbs: React.FC<{ n?: number; gap?: number }> = ({ n = 7, gap = 11 }) => (
  <div style={{ display: 'flex', justifyContent: 'center', gap }}>
    {Array.from({ length: n }, (_, k) => (
      <span key={k} style={{
        width: 8, height: 8, borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 35%,#FBE7BE,#E8BE6E)',
        boxShadow: '0 0 11px rgba(232,190,110,1)',
      }} />
    ))}
  </div>
);

/* Anneke's double rule; Perdita's masthead rule */
export const Rule: React.FC<{ w: World; strong?: boolean }> = ({ w, strong }) =>
  w.nav === 'tabs-text' ? (
    <div style={{ margin: '12px 0' }}>
      <div style={{ height: 1, background: w.ink }} />
      <div style={{ height: 1, background: w.ink, opacity: .25, marginTop: 2 }} />
    </div>
  ) : <div style={{ height: strong ? 2 : 1, background: strong ? w.ink : w.rule, margin: '12px 0' }} />;

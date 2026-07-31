import React from 'react';
import { PERSONAS, type WorldId } from '@/world/personas';

/* Deliberately world-blind: this screen runs before a world is chosen. */
export const Gate: React.FC<{ onPick: (id: WorldId) => void }> = ({ onPick }) => {
  const [sel, setSel] = React.useState<WorldId>('dressing');
  const p = PERSONAS.find(x => x.id === sel)!;

  return (
    <div style={{
      width: 390, height: 800, borderRadius: 30, overflow: 'hidden', position: 'relative',
      background: 'linear-gradient(168deg,#FBEAEE 0%,#F8E7E4 45%,#F5E3D2 100%)',
      fontFamily: 'Outfit, system-ui, sans-serif', color: '#33262B',
      boxShadow: '0 24px 60px rgba(60,40,48,.18)',
      padding: '30px 22px 0', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ textAlign: 'center', fontSize: 9.5, letterSpacing: '.32em', color: '#B08894', fontWeight: 700 }}>
        BEFORE QUESTION ONE
      </div>
      <div style={{ textAlign: 'center', fontFamily: "'Gloock', Georgia, serif", fontSize: 30, lineHeight: 1.12, marginTop: 10 }}>
        Who’s planning<br />this with you?
      </div>
      <div style={{ textAlign: 'center', fontSize: 12.5, color: '#84717A', marginTop: 8, lineHeight: 1.5 }}>
        Same encyclopaedic brain underneath.<br />Four very different bedside manners.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 20, flex: 1 }}>
        {PERSONAS.map(x => {
          const on = x.id === sel;
          return (
            <div key={x.id} onClick={() => setSel(x.id)} style={{
              background: '#fff', borderRadius: 18, padding: '12px 14px', cursor: 'pointer',
              display: 'flex', gap: 12, alignItems: 'center',
              border: on ? `1.5px solid ${x.id === 'dressing' ? '#B62D77' : x.avatar}` : '1.5px solid #EFE0DB',
              boxShadow: on ? '0 8px 22px rgba(120,60,90,.16)' : 'none',
            }}>
              <span style={{
                width: 40, height: 40, borderRadius: '50%', background: x.avatar, color: x.avatarInk,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Gloock', Georgia, serif", fontSize: 17, flex: 'none',
              }}>{x.initial}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'flex', alignItems: 'baseline', gap: 7, flexWrap: 'wrap' }}>
                  <b style={{ fontSize: 14 }}>{x.first}</b>
                  <i style={{ fontSize: 8.5, letterSpacing: '.12em', fontStyle: 'normal', fontWeight: 700, color: x.id === 'dressing' ? '#B62D77' : x.avatar }}>
                    {x.title}
                  </i>
                </span>
                <span style={{
                  display: 'block', fontFamily: x.id === 'monograph' ? 'inherit' : "'Script', cursive",
                  textTransform: x.id === 'monograph' ? 'uppercase' : 'none',
                  letterSpacing: x.id === 'monograph' ? '.14em' : 0,
                  fontSize: x.id === 'monograph' ? 9 : 13, fontWeight: x.id === 'monograph' ? 700 : 400,
                  color: x.id === 'dressing' ? '#B62D77' : x.avatar, marginTop: 2,
                }}>{x.quote}</span>
              </span>
              <span style={{
                width: 17, height: 17, borderRadius: '50%', flex: 'none',
                border: `1.5px solid ${on ? (x.id === 'dressing' ? '#B62D77' : x.avatar) : '#E0CBD3'}`,
                background: on ? x.avatar : '#fff',
                boxShadow: on ? 'inset 0 0 0 3px #fff' : 'none',
              }} />
            </div>
          );
        })}
      </div>

      <div style={{ padding: '4px 0 22px' }}>
        <div style={{ fontSize: 11.5, color: '#84717A', textAlign: 'center', marginBottom: 10, lineHeight: 1.5 }}>
          <b style={{ color: '#33262B' }}>{p.worldName}</b> — {p.worldLine}
        </div>
        <button onClick={() => onPick(sel)} style={{
          width: '100%', padding: 16, borderRadius: 19, border: 'none', cursor: 'pointer',
          background: p.avatar, color: p.avatarInk, fontFamily: 'inherit',
          fontSize: 15, fontWeight: 700, boxShadow: '0 10px 26px rgba(90,50,70,.28)',
        }}>Plan it with {p.first}</button>
      </div>
    </div>
  );
};

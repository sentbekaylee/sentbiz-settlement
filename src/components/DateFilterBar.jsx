import { useState } from 'react';
import { T, inputBase, toISO } from '../lib/tokens.js';
import { Icon } from '../lib/icons.jsx';

export default function DateFilterBar({ from, to, onChange, rightSlot }) {
  const [open, setOpen] = useState(false);

  const today = new Date();
  const todayStr  = toISO(today);
  const mStart    = toISO(new Date(today.getFullYear(), today.getMonth(), 1));
  const mEnd      = toISO(new Date(today.getFullYear(), today.getMonth() + 1, 0));
  const lmStart   = toISO(new Date(today.getFullYear(), today.getMonth() - 1, 1));
  const lmEnd     = toISO(new Date(today.getFullYear(), today.getMonth(), 0));
  const w7Start   = toISO(new Date(today.getTime() - 6 * 86400000));
  const m3Start   = toISO(new Date(today.getFullYear(), today.getMonth() - 3, today.getDate()));

  const PRESETS = [
    { label: '오늘',   f: todayStr, t: todayStr },
    { label: '이번달', f: mStart,   t: mEnd     },
    { label: '지난달', f: lmStart,  t: lmEnd    },
    { label: '1주일',  f: w7Start,  t: todayStr },
    { label: '3개월',  f: m3Start,  t: todayStr },
  ];

  const curLabel = PRESETS.find(p => p.f === from && p.t === to)?.label || '직접 입력';

  return (
    <div style={{ margin: '0 32px 20px', background: T.bg, borderRadius: 12, padding: '14px 20px', boxShadow: '0 1px 4px rgba(15,23,42,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 13, color: T.fg3, flexShrink: 0 }}>시작일</span>
      <input type="date" value={from} max={to}
        onChange={e => onChange(e.target.value, to)}
        style={{ ...inputBase, width: 140 }} />
      <span style={{ fontSize: 13, color: T.fg3, flexShrink: 0 }}>종료일</span>
      <input type="date" value={to} min={from}
        onChange={e => onChange(from, e.target.value)}
        style={{ ...inputBase, width: 140 }} />

      <div style={{ position: 'relative' }}>
        <button onClick={() => setOpen(o => !o)} style={{
          all: 'unset', boxSizing: 'border-box', cursor: 'pointer',
          height: 36, padding: '0 12px', borderRadius: 6, fontSize: 13, fontWeight: 500,
          background: T.bg, border: `1px solid ${T.borderDefault}`, color: T.fg2,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {curLabel}<Icon name="CaretDown" size={12} color={T.fg3} />
        </button>

        {open && <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 199 }} />}
        {open && (
          <div style={{ position: 'absolute', top: 40, left: 0, zIndex: 200, background: T.bg, border: `1px solid ${T.borderDefault}`, borderRadius: 8, boxShadow: '0 4px 16px rgba(15,23,42,0.12)', overflow: 'hidden', minWidth: 110 }}>
            {PRESETS.map(p => (
              <button key={p.label} onClick={() => { onChange(p.f, p.t); setOpen(false); }}
                style={{ all: 'unset', boxSizing: 'border-box', display: 'block', width: '100%', padding: '10px 16px', fontSize: 13, color: T.fg2, cursor: 'pointer', transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.background = T.surfaceNormal}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >{p.label}</button>
            ))}
          </div>
        )}
      </div>

      <div style={{ flex: 1 }} />
      {rightSlot}
    </div>
  );
}

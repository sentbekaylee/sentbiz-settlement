import { T } from './tokens.js';
import { Icon } from './icons.jsx';

export const Button = ({ type = 'solid', usage = 'primary', size = 'md', children, onClick, style }) => {
  const sizes = {
    lg: { minHeight: 48, padding: '0 16px', fontSize: 14 },
    md: { minHeight: 40, padding: '0 16px', fontSize: 14 },
    sm: { minHeight: 36, padding: '0 14px', fontSize: 12 },
    xs: { minHeight: 28, padding: '0 12px', fontSize: 11 },
  };
  const matrix = {
    'solid-primary':   { background: T.primaryHeavy, color: '#fff' },
    'solid-secondary': { background: T.surfaceStrong, color: T.primaryHeavy },
    'line-tertiary':   { background: T.bg, color: T.primaryHeavy, boxShadow: `inset 0 0 0 1px ${T.surfaceStrong}` },
  };
  const vs = matrix[`${type}-${usage}`] || matrix['solid-primary'];
  return (
    <button onClick={onClick} style={{
      all: 'unset', boxSizing: 'border-box', display: 'inline-flex',
      alignItems: 'center', justifyContent: 'center', gap: 6,
      borderRadius: 6, cursor: 'pointer', transition: 'background 150ms',
      fontWeight: 600, whiteSpace: 'nowrap',
      ...sizes[size], ...vs, ...style,
    }}>{children}</button>
  );
};

export const Badge = ({ variant = 'neutral', children }) => {
  const map = {
    positive:    { c: T.positive,     bg: T.positiveLight },
    negative:    { c: T.negative,     bg: T.negativeLight },
    waiting:     { c: T.warning,      bg: T.warningLight },
    informative: { c: T.informative,  bg: T.informativeLight },
    neutral:     { c: T.neutralFg,    bg: T.neutralBg },
    progress:    { c: T.progress,     bg: T.progressLight },
    payment:     { c: '#0746CA',      bg: '#F2F6FF' },
    refund:      { c: T.negative,     bg: T.negativeLight },
  };
  const s = map[variant] || map.neutral;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 10px',
      borderRadius: 999, color: s.c, background: s.bg,
      fontSize: 12, fontWeight: 600, lineHeight: '18px', whiteSpace: 'nowrap',
    }}>{children}</span>
  );
};

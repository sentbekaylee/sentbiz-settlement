import { useState } from 'react';
import { T } from './tokens.js';

export const Icon = ({ name, size = 20, color = T.fg2 }) => (
  <span style={{
    display: 'inline-block', width: size, height: size, flexShrink: 0,
    WebkitMask: `/design_system/assets/icons/${name}.svg center/contain no-repeat`,
    mask: `url(/design_system/assets/icons/${name}.svg) center/contain no-repeat`,
    WebkitMaskImage: `url(/design_system/assets/icons/${name}.svg)`,
    WebkitMaskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    background: color,
  }} />
);

export const IconBtn = ({ name, onClick, ariaLabel }) => {
  const [hov, setHov] = useState(false);
  return (
    <button aria-label={ariaLabel} onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        all: 'unset', boxSizing: 'border-box', display: 'inline-flex',
        alignItems: 'center', justifyContent: 'center',
        width: 36, height: 36, borderRadius: 8,
        background: hov ? T.surfaceNormal : 'transparent',
        cursor: 'pointer', transition: 'background 120ms',
      }}>
      <Icon name={name} size={20} color={T.fg2} />
    </button>
  );
};

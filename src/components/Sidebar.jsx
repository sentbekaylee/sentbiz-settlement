import { useState } from 'react';
import { T } from '../lib/tokens.js';
import { Icon } from '../lib/icons.jsx';

const NAV_GROUPS = [
  {
    key: 'request-to-payment',
    label: 'Request to Payment',
    icon: 'ArrowsLeftRight',
    children: [
      { key: 'settlement-daily',  icon: 'ClipboardText', label: '정산 일자별 조회' },
      { key: 'settlement-detail', icon: 'List',          label: '정산 건별 조회' },
      { key: 'payment',           icon: 'Receipt',       label: '결제 환불 내역' },
    ],
  },
];

const FOOTER_NAV = [
  { key: 'settings', icon: 'Gear',     label: '설정' },
  { key: 'help',     icon: 'Question', label: '도움말' },
];

const SidebarItem = ({ icon, label, isActive, folded, onClick, indent = false }) => {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        all: 'unset', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 6,
        height: 40, margin: '0 8px',
        padding: indent && !folded ? '8px 4px 8px 16px' : '8px 4px',
        width: folded ? 'auto' : 224,
        justifyContent: folded ? 'center' : 'flex-start',
        borderRadius: 4, cursor: 'pointer', transition: 'background 0.15s',
        background: isActive ? 'rgba(203,213,225,0.20)' : hov ? 'rgba(203,213,225,0.10)' : 'transparent',
      }}>
      <div style={{ width: 24, height: 24, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={indent ? 14 : 20} color={isActive ? '#fff' : '#CBD5E1'} />
      </div>
      {!folded && (
        <span style={{ fontSize: indent ? 13 : 14, fontWeight: isActive ? 600 : 500, color: isActive ? '#fff' : '#CBD5E1', whiteSpace: 'nowrap' }}>
          {label}
        </span>
      )}
    </button>
  );
};

const SidebarGroup = ({ group, active, onNavigate, folded }) => {
  const [open, setOpen] = useState(true);
  const isGroupActive = group.children.some(c => c.key === active);
  return (
    <div>
      <button onClick={() => setOpen(o => !o)}
        style={{
          all: 'unset', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 6,
          height: 40, padding: '8px 4px', margin: '0 8px', width: folded ? 'auto' : 224,
          justifyContent: folded ? 'center' : 'flex-start', borderRadius: 4, cursor: 'pointer',
          transition: 'background 0.15s',
          background: open ? 'rgba(203,213,225,0.08)' : 'transparent',
        }}>
        <div style={{ width: 28, height: 28, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={group.icon} size={20} color={isGroupActive ? '#fff' : '#CBD5E1'} />
        </div>
        {!folded && <>
          <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: isGroupActive ? '#fff' : '#CBD5E1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {group.label}
          </span>
          <Icon name={open ? 'CaretUp' : 'CaretDown'} size={12} color="#94A3B8" />
        </>}
      </button>
      {open && group.children.map(({ key, icon, label }) => (
        <SidebarItem key={key} icon={icon} label={label} isActive={active === key}
          folded={folded} indent onClick={() => onNavigate(key)} />
      ))}
    </div>
  );
};

export default function Sidebar({ active, onNavigate, folded, onToggleFold }) {
  return (
    <aside style={{ width: folded ? 64 : 240, flexShrink: 0, height: '100%', background: '#122666', display: 'flex', flexDirection: 'column', transition: 'width 0.2s ease-in-out', overflow: 'hidden' }}>
      <div style={{ height: 68, flexShrink: 0, display: 'flex', alignItems: 'center', padding: folded ? 0 : '0 20px', justifyContent: folded ? 'center' : 'flex-start', borderBottom: '1px solid rgba(203,213,225,0.10)' }}>
        {folded
          ? <img src="/design_system/assets/logos/logo-mark-dark-navy.svg" width="28" height="28" alt="SentBiz" />
          : <img src="/design_system/assets/logos/wordmark-white.svg" width="92" height="20" alt="sentbiz" />
        }
      </div>
      <nav style={{ padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {NAV_GROUPS.map(group => (
          <SidebarGroup key={group.key} group={group} active={active} onNavigate={onNavigate} folded={folded} />
        ))}
      </nav>
      <div style={{ padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 2, borderTop: '1px solid rgba(203,213,225,0.10)' }}>
        {FOOTER_NAV.map(({ key, icon, label }) => (
          <SidebarItem key={key} icon={icon} label={label} isActive={false} folded={folded} onClick={() => {}} />
        ))}
        <div style={{ padding: folded ? 0 : '8px 20px', display: 'flex', justifyContent: folded ? 'center' : 'flex-end', marginTop: 4 }}>
          <button onClick={onToggleFold} style={{ all: 'unset', cursor: 'pointer', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="SidebarSimple" size={20} color="#94A3B8" />
          </button>
        </div>
      </div>
    </aside>
  );
}

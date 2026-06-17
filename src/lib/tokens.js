export const T = {
  primary: '#0746CA', primaryStrong: '#0C3698', primaryHeavy: '#122666',
  fg1: '#0F172A', fg2: '#293548', fg3: '#64748B', fg4: '#94A3B8', fgDisable: '#CBD5E1',
  bg: '#FFFFFF', surfaceNormal: '#F8FAFC', surfaceStrong: '#EAEFF5', surfaceHeavy: '#E2E8F0',
  positive: '#00C592', positiveLight: '#DFFBED',
  warning: '#FF6200', warningLight: '#FFEFD3',
  negative: '#F91C1C', negativeLight: '#FFEFEF',
  progress: '#1890FF', progressLight: '#E6F7FF',
  informative: '#3176FD', informativeLight: '#F2F6FF',
  neutralFg: '#293548', neutralBg: '#F1F5F9',
  borderSubtle: 'rgba(112,115,124,0.22)', borderDefault: '#CBD5E1',
};

export const inputBase = {
  height: 36, padding: '0 12px', border: `1px solid #CBD5E1`,
  borderRadius: 6, fontSize: 13, color: '#293548', background: '#FFFFFF',
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
};

export const selectBase = {
  ...inputBase, cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none',
  paddingRight: 32,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748B' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
};

export const flbl = { fontSize: 14, fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', flexShrink: 0 };
export const frow = { display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 };

export const fmt = n => (n || 0).toLocaleString('ko-KR');
export const toISO = d => d.toISOString().split('T')[0];

export const STATUS_MAP = {
  성공: { v: 'positive' }, 실패: { v: 'negative' }, 처리중: { v: 'progress' },
  대기: { v: 'waiting' }, 수취완료: { v: 'positive' }, 부분수취: { v: 'neutral' },
  만료: { v: 'neutral' }, 환불완료: { v: 'refund' }, 부분환불완료: { v: 'neutral' },
};

export const SUMMARY_STATUS_MAP = {
  READY:     { label: '정산준비', v: 'waiting' },
  CONFIRMED: { label: '확정',     v: 'progress' },
  PAID:      { label: '지급완료', v: 'positive' },
};

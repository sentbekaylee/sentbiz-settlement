import { useState } from 'react';
import { T, fmt, toISO, SUMMARY_STATUS_MAP } from '../../lib/tokens.js';
import { Badge } from '../../lib/primitives.jsx';
import { DataTable, amtR } from '../../lib/table.jsx';
import SettlementMetrics from '../../components/SettlementMetrics.jsx';
import { SETTLEMENT_SUMMARY } from '../../data/settlement.js';

// ─── Search panel shared styles ──────────────────────────────────────────────
const LABEL = { fontSize: 14, fontWeight: 600, color: '#1A1A1A', whiteSpace: 'nowrap', width: 70, flexShrink: 0 };
const FIELD = { display: 'flex', gap: 8, alignItems: 'center', width: 351 };
const plainInput = {
  height: 38, background: '#FFFFFF', border: '1px solid #E3E6EB', borderRadius: 8,
  fontSize: 14, color: '#1A1A1A', outline: 'none', fontFamily: 'inherit',
  boxSizing: 'border-box', padding: '0 16px', flex: 1,
};
const compositeBox = {
  height: 38, background: '#FFFFFF', border: '1px solid #E3E6EB', borderRadius: 8,
  display: 'flex', alignItems: 'center', overflow: 'hidden', flex: 1,
};
const arrowBg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748B' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`;
const compositeTextInput = {
  flex: 1, border: 'none', outline: 'none', padding: '0 12px',
  fontSize: 13, color: '#1A1A1A', background: 'transparent',
  fontFamily: 'inherit', height: '100%', minWidth: 0,
};
const VDivider = () => <div style={{ width: 1, height: 20, background: '#E9ECF1', flexShrink: 0 }} />;

// ─── Table columns ────────────────────────────────────────────────────────────
const txt = v => (
  <div style={{ fontSize: 13, color: T.fg2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
    {v || '—'}
  </div>
);

const COLS = (handleConfirm, handlePaid) => [
  { key: '정산일',          w: '120px', sortable: true,
    render: r => <div style={{ fontSize: 13, fontWeight: 700, color: T.fg1, whiteSpace: 'nowrap' }}>{r.target_date}</div> },
  { key: '채널',            w: '120px', render: r => txt(r.channel) },
  { key: '정산 건수',       w: '80px',
    render: r => <div style={{ fontSize: 13, color: T.fg2, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.payment_count}건</div> },
  { key: '정산 금액',       w: '150px', render: r => amtR(r.settlement_amount, r.currency, T.positive) },
  { key: '환불 건수',       w: '80px',
    render: r => <div style={{ fontSize: 13, color: r.refund_count ? T.negative : T.fg4, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.refund_count ? `${r.refund_count}건` : '—'}</div> },
  { key: '환불 금액',       w: '150px',
    render: r => r.total_refund_amount ? amtR(r.total_refund_amount, r.currency, T.negative) : <div style={{ fontSize: 13, color: T.fg4, textAlign: 'right' }}>—</div> },
  { key: '거래 금액',       w: '150px', render: r => amtR(r.total_payment_amount, r.currency) },
  { key: '전체 수수료',     w: '130px', render: r => amtR(r.total_fee_amount, r.currency, T.fg2) },
  { key: 'PG 수수료 부가세',w: '110px', render: r => amtR(r.vat_amount, r.currency, T.fg3) },
  { key: '상태',            w: '100px',
    render: r => <Badge variant={SUMMARY_STATUS_MAP[r.status]?.v || 'neutral'}>{SUMMARY_STATUS_MAP[r.status]?.label || r.status}</Badge> },
  { key: '액션',            w: '120px',
    render: r => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {r.status === 'READY' && (
          <button onClick={e => { e.stopPropagation(); handleConfirm(r.id); }} style={{
            all: 'unset', cursor: 'pointer', border: `1px solid ${T.borderDefault}`,
            borderRadius: 4, padding: '4px 10px', fontSize: 12, color: T.primaryHeavy,
          }}>확정하기</button>
        )}
        {r.status === 'CONFIRMED' && (
          <button onClick={e => { e.stopPropagation(); handlePaid(r.id); }} style={{
            all: 'unset', cursor: 'pointer', background: T.primaryHeavy,
            borderRadius: 4, padding: '4px 10px', fontSize: 12, color: '#fff',
          }}>PAID 반영</button>
        )}
        {r.status === 'PAID' && r.paid_at && (
          <span style={{ fontSize: 11, color: T.fg4, whiteSpace: 'nowrap' }}>{r.paid_at}</span>
        )}
      </div>
    ),
  },
];

// ─── Main component ───────────────────────────────────────────────────────────
export default function SettlementDaily() {
  const today   = new Date();
  const initFrom = toISO(new Date(today.getFullYear(), today.getMonth(), 1));
  const initTo   = toISO(new Date(today.getFullYear(), today.getMonth() + 1, 0));

  const [dateFrom,  setDateFrom]  = useState(initFrom);
  const [dateTo,    setDateTo]    = useState(initTo);
  const [channel,   setChannel]   = useState('');
  const [merchant,  setMerchant]  = useState('');
  const [mchType,   setMchType]   = useState('상점명');
  const [status,    setStatus]    = useState('all');
  const [rows,      setRows]      = useState([]);
  const [searched,  setSearched]  = useState(false);

  const handleSearch = () => {
    let result = SETTLEMENT_SUMMARY;
    if (status !== 'all') result = result.filter(r => r.status === status);
    if (channel.trim()) result = result.filter(r => r.channel.includes(channel.trim()));
    if (merchant.trim()) result = result.filter(r => r.client_name.includes(merchant.trim()) || r.client_id.includes(merchant.trim()));
    setRows(result);
    setSearched(true);
  };

  const handleConfirm = id => setRows(prev => prev.map(r => r.id === id ? { ...r, status: 'CONFIRMED' } : r));
  const handlePaid    = id => setRows(prev => prev.map(r => r.id === id ? { ...r, status: 'PAID', paid_at: '2026-03-27 10:00' } : r));

  const cols = COLS(handleConfirm, handlePaid);

  return (
    <>
      {/* Search Panel */}
      <div style={{ margin: '0 32px 20px' }}>
        <div style={{ background: '#F9FAFB', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 24, border: '1px solid #EAEFF5' }}>
          <div style={{ display: 'flex', gap: 54, alignItems: 'center' }}>

            {/* 정산 일자 */}
            <div style={FIELD}>
              <span style={LABEL}>정산 일자</span>
              <div style={compositeBox}>
                <input
                  type="date" value={dateFrom} max={dateTo}
                  onChange={e => setDateFrom(e.target.value)}
                  style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: '#1A1A1A', fontFamily: 'inherit', flex: 1, minWidth: 0, height: '100%', cursor: 'pointer', padding: '0 4px 0 12px' }}
                />
                <span style={{ color: '#94A3B8', padding: '0 4px', flexShrink: 0 }}>~</span>
                <input
                  type="date" value={dateTo} min={dateFrom}
                  onChange={e => setDateTo(e.target.value)}
                  style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: '#1A1A1A', fontFamily: 'inherit', flex: 1, minWidth: 0, height: '100%', cursor: 'pointer', padding: '0 12px 0 4px' }}
                />
              </div>
            </div>

            {/* 채널 */}
            <div style={FIELD}>
              <span style={LABEL}>채널</span>
              <div style={compositeBox}>
                <span style={{ fontSize: 14, color: '#303030', padding: '0 8px 0 12px', whiteSpace: 'nowrap', flexShrink: 0 }}>채널명</span>
                <VDivider />
                <input value={channel} onChange={e => setChannel(e.target.value)} placeholder="채널명 입력" style={compositeTextInput} />
              </div>
            </div>

            {/* 고객사 상점명 */}
            <div style={FIELD}>
              <span style={LABEL}>고객사</span>
              <div style={compositeBox}>
                <select
                  value={mchType}
                  onChange={e => setMchType(e.target.value)}
                  style={{ border: 'none', background: 'transparent', fontSize: 14, color: '#303030', outline: 'none', cursor: 'pointer', height: '100%', fontFamily: 'inherit', flexShrink: 0, appearance: 'none', WebkitAppearance: 'none', padding: '0 20px 0 12px', backgroundImage: arrowBg, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 4px center' }}
                >
                  <option>상점명</option>
                  <option>상점ID</option>
                </select>
                <VDivider />
                <input value={merchant} onChange={e => setMerchant(e.target.value)} placeholder="상점명/ID 입력" style={compositeTextInput} />
              </div>
            </div>

            {/* 배치 상태 */}
            <div style={FIELD}>
              <span style={LABEL}>배치 상태</span>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                style={{ ...plainInput, cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none', backgroundImage: arrowBg, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 32 }}
              >
                <option value="all">전체</option>
                <option value="READY">정산준비</option>
                <option value="CONFIRMED">확정</option>
                <option value="PAID">지급완료</option>
              </select>
            </div>
          </div>

          <div style={{ height: 1, background: '#F5F5F5' }} />

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={handleSearch}
              style={{ all: 'unset', cursor: 'pointer', background: '#303030', color: '#FFFFFF', borderRadius: 4, padding: '12px 24px', minWidth: 88, textAlign: 'center', fontSize: 14, fontWeight: 600, letterSpacing: '0.175px', boxSizing: 'border-box' }}
            >
              조회
            </button>
          </div>
        </div>
      </div>

      {searched && (
        <>
          <SettlementMetrics rows={rows} />
          <DataTable rows={rows} colKeys={cols.map(c => c.key)} colDefs={cols} showToolbar />
        </>
      )}
    </>
  );
}

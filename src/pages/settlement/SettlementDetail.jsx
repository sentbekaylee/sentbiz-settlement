import { useState } from 'react';
import { T, fmt, toISO, STATUS_MAP } from '../../lib/tokens.js';
import { Badge } from '../../lib/primitives.jsx';
import { DataTable, amtR, mono } from '../../lib/table.jsx';
import SettlementMetrics from '../../components/SettlementMetrics.jsx';
import { SETTLEMENT_ROWS, SETTLEMENT_SUMMARY } from '../../data/settlement.js';

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
const prefixSelectStyle = {
  border: 'none', background: 'transparent', fontSize: 14, color: '#303030',
  outline: 'none', cursor: 'pointer', height: '100%', fontFamily: 'inherit',
  flexShrink: 0, appearance: 'none', WebkitAppearance: 'none',
  padding: '0 20px 0 12px', backgroundImage: arrowBg,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 4px center',
};
const compositeSelectStyle = {
  border: 'none', background: 'transparent', fontSize: 14, color: '#303030',
  outline: 'none', cursor: 'pointer', height: '100%', fontFamily: 'inherit',
  flex: 1, minWidth: 0, appearance: 'none', WebkitAppearance: 'none',
  padding: '0 28px 0 12px', backgroundImage: arrowBg,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center',
};
const VDivider = () => <div style={{ width: 1, height: 20, background: '#E9ECF1', flexShrink: 0 }} />;

// ─── Table columns ────────────────────────────────────────────────────────────
const DETAIL_COLS = [
  { key: '거래 유형',      w: '80px',
    render: r => <Badge variant={r.transaction_type === 'PAYMENT' ? 'payment' : 'refund'}>{r.transaction_type === 'PAYMENT' ? '결제' : '환불'}</Badge> },
  { key: '거래일',         w: '130px',
    render: r => <div style={{ fontSize: 13, color: T.fg2, whiteSpace: 'nowrap' }}>{r.transaction_date}</div> },
  { key: '정산일',         w: '130px',
    render: r => <div style={{ fontSize: 13, color: T.fg2, whiteSpace: 'nowrap' }}>{r.settlement_date || '—'}</div> },
  { key: '채널',           w: '100px',
    render: r => <div style={{ fontSize: 13, color: T.fg2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.channel || '—'}</div> },
  { key: '고객사 상점 ID', w: '140px', render: r => <div style={mono}>{r.client_merchant_id || '—'}</div> },
  { key: '고객사 주문 ID', w: '160px', render: r => <div style={mono}>{r.client_order_id || '—'}</div> },
  { key: '결제/환불 ID',   w: '180px', render: r => <div style={mono}>{r.transaction_payment_id || r.transaction_refund_id || '—'}</div> },
  { key: '결제 통화',      w: '80px',
    render: r => <div style={{ fontSize: 13, color: T.fg3, textAlign: 'center' }}>{r.transaction_currency}</div> },
  { key: '결제 금액',      w: '140px', render: r => amtR(r.payment_amount || 0, r.transaction_currency) },
  { key: '정산 통화',      w: '80px',
    render: r => <div style={{ fontSize: 13, color: T.fg3, textAlign: 'center' }}>{r.settlement_currency}</div> },
  { key: '정산 금액',      w: '140px',
    render: r => (
      <div style={{ fontSize: 13, fontWeight: 600, color: r.settlement_amount < 0 ? T.negative : T.positive, textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
        {r.settlement_amount < 0 ? '−' : ''}{fmt(Math.abs(r.settlement_amount))}<span style={{ fontSize: 11, fontWeight: 400, color: T.fg4, marginLeft: 3 }}>{r.settlement_currency}</span>
      </div>
    )},
];

// ─── Main component ───────────────────────────────────────────────────────────
export default function SettlementDetail() {
  const today    = new Date();
  const initFrom = toISO(new Date(today.getFullYear(), today.getMonth(), 1));
  const initTo   = toISO(new Date(today.getFullYear(), today.getMonth() + 1, 0));

  const [dateType,   setDateType]   = useState('정산일자');
  const [dateFrom,   setDateFrom]   = useState(initFrom);
  const [dateTo,     setDateTo]     = useState(initTo);
  const [channel,    setChannel]    = useState('');
  const [merchant,   setMerchant]   = useState('');
  const [mchType,    setMchType]    = useState('상점명');
  const [txStatus,   setTxStatus]   = useState('all');
  const [idType,     setIdType]     = useState('결제 ID');
  const [idValue,    setIdValue]    = useState('');
  const [payCur,     setPayCur]     = useState('all');
  const [settCur,    setSettCur]    = useState('all');
  const [rows,       setRows]       = useState([]);
  const [searched,   setSearched]   = useState(false);

  const handleSearch = () => {
    let result = SETTLEMENT_ROWS;
    if (txStatus !== 'all') result = result.filter(r => r.transaction_type === txStatus);
    if (channel.trim()) result = result.filter(r => r.channel?.includes(channel.trim()));
    if (merchant.trim()) {
      if (mchType === '상점명') result = result.filter(r => r.client_merchant_id?.includes(merchant.trim()));
      else result = result.filter(r => r.client_merchant_id?.includes(merchant.trim()));
    }
    if (idValue.trim()) {
      if (idType === '결제 ID') result = result.filter(r => (r.transaction_payment_id || '').includes(idValue.trim()));
      else result = result.filter(r => (r.client_order_id || '').includes(idValue.trim()));
    }
    if (payCur !== 'all') result = result.filter(r => r.transaction_currency === payCur);
    if (settCur !== 'all') result = result.filter(r => r.settlement_currency === settCur);
    setRows(result);
    setSearched(true);
  };

  return (
    <>
      {/* Search Panel */}
      <div style={{ margin: '0 32px 20px' }}>
        <div style={{ background: '#F9FAFB', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 24, border: '1px solid #EAEFF5' }}>

          {/* Row 1 */}
          <div style={{ display: 'flex', gap: 54, alignItems: 'center' }}>
            {/* 일자 */}
            <div style={FIELD}>
              <span style={LABEL}>일자</span>
              <div style={compositeBox}>
                <select value={dateType} onChange={e => setDateType(e.target.value)} style={prefixSelectStyle}>
                  <option>정산일자</option>
                  <option>거래일자</option>
                </select>
                <VDivider />
                <input
                  type="date" value={dateFrom} max={dateTo}
                  onChange={e => setDateFrom(e.target.value)}
                  style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: '#1A1A1A', fontFamily: 'inherit', flex: 1, minWidth: 0, height: '100%', cursor: 'pointer', padding: '0 2px 0 8px' }}
                />
                <span style={{ color: '#94A3B8', flexShrink: 0 }}>~</span>
                <input
                  type="date" value={dateTo} min={dateFrom}
                  onChange={e => setDateTo(e.target.value)}
                  style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: '#1A1A1A', fontFamily: 'inherit', flex: 1, minWidth: 0, height: '100%', cursor: 'pointer', padding: '0 8px 0 2px' }}
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

            {/* 고객사 */}
            <div style={FIELD}>
              <span style={LABEL}>고객사</span>
              <div style={compositeBox}>
                <select value={mchType} onChange={e => setMchType(e.target.value)} style={prefixSelectStyle}>
                  <option>상점명</option>
                  <option>상점ID</option>
                </select>
                <VDivider />
                <input value={merchant} onChange={e => setMerchant(e.target.value)} placeholder="상점명/ID 입력" style={compositeTextInput} />
              </div>
            </div>

            {/* 상태 */}
            <div style={FIELD}>
              <span style={LABEL}>상태</span>
              <select
                value={txStatus}
                onChange={e => setTxStatus(e.target.value)}
                style={{ ...plainInput, cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none', backgroundImage: arrowBg, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 32 }}
              >
                <option value="all">전체</option>
                <option value="PAYMENT">결제</option>
                <option value="REFUND">환불</option>
              </select>
            </div>
          </div>

          {/* Row 2 */}
          <div style={{ display: 'flex', gap: 54, alignItems: 'center' }}>
            {/* ID 검색 */}
            <div style={FIELD}>
              <span style={LABEL}>ID 검색</span>
              <div style={compositeBox}>
                <select value={idType} onChange={e => setIdType(e.target.value)} style={prefixSelectStyle}>
                  <option>결제 ID</option>
                  <option>고객사 주문 ID</option>
                </select>
                <VDivider />
                <input value={idValue} onChange={e => setIdValue(e.target.value)} placeholder="ID 입력" style={compositeTextInput} />
              </div>
            </div>

            {/* 결제 통화 */}
            <div style={FIELD}>
              <span style={LABEL}>결제 통화</span>
              <div style={compositeBox}>
                <span style={{ fontSize: 14, color: '#303030', padding: '0 8px 0 12px', whiteSpace: 'nowrap', flexShrink: 0 }}>결제 통화</span>
                <VDivider />
                <select value={payCur} onChange={e => setPayCur(e.target.value)} style={compositeSelectStyle}>
                  <option value="all">전체</option>
                  <option value="KRW">KRW</option>
                  <option value="USD">USD</option>
                  <option value="JPY">JPY</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            {/* 정산 통화 */}
            <div style={FIELD}>
              <span style={LABEL}>정산 통화</span>
              <div style={compositeBox}>
                <span style={{ fontSize: 14, color: '#303030', padding: '0 8px 0 12px', whiteSpace: 'nowrap', flexShrink: 0 }}>정산 통화</span>
                <VDivider />
                <select value={settCur} onChange={e => setSettCur(e.target.value)} style={compositeSelectStyle}>
                  <option value="all">전체</option>
                  <option value="KRW">KRW</option>
                  <option value="USD">USD</option>
                  <option value="JPY">JPY</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            {/* spacer */}
            <div style={{ width: 351 }} />
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
          <SettlementMetrics rows={SETTLEMENT_SUMMARY} />
          <DataTable
            rows={rows}
            colKeys={DETAIL_COLS.map(c => c.key)}
            colDefs={DETAIL_COLS}
          />
        </>
      )}
    </>
  );
}

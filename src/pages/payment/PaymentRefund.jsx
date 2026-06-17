import { useState } from 'react';
import { T, selectBase, fmt, STATUS_MAP } from '../../lib/tokens.js';
import { Badge } from '../../lib/primitives.jsx';
import { DataTable, amtR, mono } from '../../lib/table.jsx';
import { PAYMENT_ROWS } from '../../data/payment.js';
import PaymentDetailModal from './PaymentDetailModal.jsx';

// ─── Summary Bar ────────────────────────────────────────────────────────────

const StatDivider = () => (
  <div style={{ width: 1, height: 44, background: '#EAEFF5', flexShrink: 0, margin: '0 24px 0 0' }} />
);

const StatItem = ({ label, value, color }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, paddingRight: 24 }}>
    <span style={{ fontSize: 14, color: '#757575', lineHeight: '20px' }}>{label}</span>
    <span style={{ fontSize: 16, fontWeight: 600, color, lineHeight: '24px', whiteSpace: 'nowrap' }}>{value}</span>
  </div>
);

function SummaryBar() {
  const totalCount   = PAYMENT_ROWS.length;
  const receivedCnt  = PAYMENT_ROWS.filter(r => r.status === '수취완료').length;
  const pendingCnt   = PAYMENT_ROWS.filter(r => r.status === '대기').length;
  const failedCnt    = PAYMENT_ROWS.filter(r => r.status === '실패').length;
  const totalAmt     = PAYMENT_ROWS.reduce((s, r) => s + (r.receive_amount || 0), 0);

  return (
    <div style={{
      margin: '0 32px 16px', background: '#FFFFFF', borderRadius: 8,
      border: '1px solid #EEEEEE', boxShadow: '0 2px 4px rgba(15,23,42,0.08)',
      height: 80, padding: '0 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      {/* 좌: 아이콘 + 타이틀 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 40, height: 40, background: T.surfaceNormal, borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          fontSize: 20,
        }}>🪙</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: T.fg1, lineHeight: '24px' }}>일간 현황</span>
          <span style={{ fontSize: 12, color: T.fg4, lineHeight: '18px', whiteSpace: 'nowrap' }}>
            2026. 6. 15 (KST 00:00 ~ 23:59) 기준 집계
          </span>
        </div>
      </div>

      {/* 우: 통계 */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <StatItem label="전체 건수"  value={`${totalCount}건`}  color="#303030" />
        <StatDivider />
        <StatItem label="수취완료"   value={`${receivedCnt}건`} color={T.positive} />
        <StatDivider />
        <StatItem label="대기"       value={`${pendingCnt}건`}  color={T.warning} />
        <StatDivider />
        <StatItem label="실패"       value={`${failedCnt}건`}   color={T.negative} />
        <StatDivider />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
          <span style={{ fontSize: 14, color: '#757575', lineHeight: '20px' }}>총 결제금액</span>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#303030', lineHeight: '24px' }}>
            {fmt(totalAmt)}<span style={{ fontSize: 14, fontWeight: 400, color: T.fg4, marginLeft: 4 }}>KRW</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Search Panel ────────────────────────────────────────────────────────────

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

const PrefixSelect = ({ options, value, onChange }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    style={{
      border: 'none', background: 'transparent', fontSize: 14, color: '#303030',
      outline: 'none', cursor: 'pointer', height: '100%', fontFamily: 'inherit',
      flexShrink: 0, appearance: 'none', WebkitAppearance: 'none',
      padding: '0 20px 0 12px',
      backgroundImage: arrowBg,
      backgroundRepeat: 'no-repeat', backgroundPosition: 'right 4px center',
    }}
  >
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);

const CompositeInput = ({ prefixLabel, prefixOptions, prefixValue, onPrefixChange, placeholder, value, onChange, suffix }) => (
  <div style={compositeBox}>
    {prefixOptions
      ? <PrefixSelect options={prefixOptions} value={prefixValue} onChange={onPrefixChange} />
      : <span style={{ fontSize: 14, color: '#303030', padding: '0 8px 0 12px', whiteSpace: 'nowrap', flexShrink: 0 }}>{prefixLabel}</span>
    }
    <div style={{ width: 1, height: 20, background: '#E9ECF1', flexShrink: 0 }} />
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        flex: 1, border: 'none', outline: 'none', padding: '0 12px',
        fontSize: 13, color: '#1A1A1A', background: 'transparent',
        fontFamily: 'inherit', height: '100%', minWidth: 0,
      }}
    />
    {suffix && <span style={{ padding: '0 12px 0 4px', color: '#94A3B8', fontSize: 14, flexShrink: 0 }}>{suffix}</span>}
  </div>
);

// ─── Table columns ───────────────────────────────────────────────────────────

const COLS = [
  { key: '상태',          w: '180px',
    render: r => <Badge variant={STATUS_MAP[r.status]?.v || 'neutral'}>{r.status}</Badge> },
  { key: '결제요청 일시', w: '220px', sortable: true,
    render: r => <div style={{ fontSize: 12, color: T.fg2, whiteSpace: 'nowrap' }}>{r.payment_date}</div> },
  { key: '결제 일시',     w: '220px', sortable: true,
    render: r => <div style={{ fontSize: 12, color: r.updated_at === '—' ? T.fg4 : T.fg2, whiteSpace: 'nowrap' }}>{r.updated_at || '—'}</div> },
  { key: '고객사 주문 ID',w: '160px',
    render: r => <div style={mono}>{r.client_order_id}</div> },
  { key: '채널',          w: '160px',
    render: r => <div style={{ fontSize: 13, color: T.fg2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.channel_display}</div> },
  { key: '가맹점',        w: '180px',
    render: r => <div style={{ fontSize: 13, color: T.fg2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.merchant_display}</div> },
  { key: '구매자',        w: '200px',
    render: r => <div style={{ fontSize: 12, color: T.fg2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.buyer_display}</div> },
  { key: '주문 금액',     w: '180px', align: 'right', sortable: true,
    render: r => amtR(r.request_amount, r.request_currency) },
  { key: '수취 금액',     w: '180px', align: 'right', sortable: true,
    render: r => amtR(r.receive_amount, r.receive_currency, T.positive) },
  { key: '환불 금액',     w: '180px', align: 'right', sortable: true,
    render: r => amtR(r.refund_amount, r.refund_currency, T.negative) },
  { key: '전체 수수료',   w: '100px',
    render: r => {
      const total = (r.sentbiz_fee_amount || 0) + (r.channel_fee_amount || 0);
      return total > 0
        ? <div style={{ fontSize: 13, fontWeight: 600, color: T.fg2, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{fmt(total)}</div>
        : <div style={{ fontSize: 13, color: T.fg4, textAlign: 'center' }}>—</div>;
    },
  },
  { key: 'External ID',  w: '180px',
    render: r => <div style={mono}>{r.external_id || '—'}</div> },
];

// ─── Main component ──────────────────────────────────────────────────────────

export default function PaymentRefund() {
  const [status,    setStatus]    = useState('전체');
  const [dateType,  setDateType]  = useState('결제요청일시');
  const [idType,    setIdType]    = useState('고객사주문 ID');
  const [idVal,     setIdVal]     = useState('');
  const [chType,    setChType]    = useState('채널명');
  const [channel,   setChannel]   = useState('');
  const [mchType,   setMchType]   = useState('가맹점명');
  const [merchant,  setMerchant]  = useState('');
  const [buyer,     setBuyer]     = useState('');
  const [rows,      setRows]      = useState(PAYMENT_ROWS);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleSearch = () => {
    let result = PAYMENT_ROWS;
    if (status !== '전체') result = result.filter(r => r.status === status);
    if (idVal.trim())      result = result.filter(r => r.client_order_id.includes(idVal.trim()));
    if (channel.trim())    result = result.filter(r => r.channel_display.includes(channel.trim()));
    if (merchant.trim())   result = result.filter(r => r.merchant_display.includes(merchant.trim()));
    if (buyer.trim())      result = result.filter(r => r.buyer_display.includes(buyer.trim()));
    setRows(result);
  };

  return (
    <>
      <SummaryBar />

      {/* Search Panel */}
      <div style={{ margin: '0 32px 20px' }}>
        <div style={{ background: '#F9FAFB', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 24, border: '1px solid #EAEFF5' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Row 1 */}
            <div style={{ display: 'flex', gap: 54, alignItems: 'center' }}>
              {/* 상태 */}
              <div style={FIELD}>
                <span style={LABEL}>상태</span>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  style={{
                    ...plainInput, cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748B' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 32,
                  }}
                >
                  <option>전체</option>
                  <option>대기</option>
                  <option>수취완료</option>
                  <option>부분수취</option>
                  <option>실패</option>
                </select>
              </div>

              {/* 일자 기준 */}
              <div style={FIELD}>
                <span style={LABEL}>일자 기준</span>
                <div style={compositeBox}>
                  <PrefixSelect
                    options={['결제요청일시', '결제일시']}
                    value={dateType}
                    onChange={setDateType}
                  />
                  <div style={{ width: 1, height: 20, background: '#E9ECF1', flexShrink: 0 }} />
                  <span style={{ flex: 1, padding: '0 8px 0 12px', fontSize: 14, color: '#C7C9CD', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    YYYY.MM.DD - YYYY.MM.DD
                  </span>
                  <span style={{ padding: '0 12px 0 4px', color: '#94A3B8', fontSize: 14, flexShrink: 0 }}>🗓</span>
                </div>
              </div>

              {/* ID 검색 */}
              <div style={FIELD}>
                <span style={LABEL}>ID 검색</span>
                <CompositeInput
                  prefixOptions={['고객사주문 ID', 'Session ID', '결제 ID']}
                  prefixValue={idType}
                  onPrefixChange={setIdType}
                  placeholder="결제거래 ID 입력"
                  value={idVal}
                  onChange={setIdVal}
                />
              </div>

              {/* 채널 */}
              <div style={FIELD}>
                <span style={LABEL}>채널</span>
                <CompositeInput
                  prefixOptions={['채널명']}
                  prefixValue={chType}
                  onPrefixChange={setChType}
                  placeholder="채널명 입력"
                  value={channel}
                  onChange={setChannel}
                />
              </div>
            </div>

            {/* Row 2 */}
            <div style={{ display: 'flex', gap: 54, alignItems: 'center' }}>
              {/* 가맹점 */}
              <div style={FIELD}>
                <span style={LABEL}>가맹점</span>
                <CompositeInput
                  prefixOptions={['가맹점명', '가맹점 ID']}
                  prefixValue={mchType}
                  onPrefixChange={setMchType}
                  placeholder="가맹점 ID 입력"
                  value={merchant}
                  onChange={setMerchant}
                />
              </div>

              {/* 구매자 */}
              <div style={FIELD}>
                <span style={LABEL}>구매자</span>
                <input
                  value={buyer}
                  onChange={e => setBuyer(e.target.value)}
                  placeholder="구매자 입력명"
                  style={plainInput}
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: '#F5F5F5' }} />

          {/* 조회 버튼 */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={handleSearch}
              style={{
                all: 'unset', cursor: 'pointer',
                background: '#303030', color: '#FFFFFF',
                borderRadius: 4, padding: '12px 24px', minWidth: 88,
                textAlign: 'center', fontSize: 14, fontWeight: 600,
                letterSpacing: '0.175px', boxSizing: 'border-box',
              }}
            >
              조회
            </button>
          </div>
        </div>
      </div>

      <DataTable
        rows={rows}
        colKeys={COLS.map(c => c.key)}
        colDefs={COLS}
        onRowClick={setSelectedRow}
        showToolbar
      />

      {selectedRow && <PaymentDetailModal row={selectedRow} onClose={() => setSelectedRow(null)} />}
    </>
  );
}

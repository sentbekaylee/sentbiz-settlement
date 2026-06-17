import { useState, useMemo } from 'react';
import { T, fmt, toISO } from '../../lib/tokens.js';
import { Badge } from '../../lib/primitives.jsx';
import { DataTable, amtR, mono } from '../../lib/table.jsx';
import SettlementMetrics from '../../components/SettlementMetrics.jsx';
import { SETTLEMENT_ROWS, SETTLEMENT_SUMMARY } from '../../data/settlement.js';

// ─── i18n ─────────────────────────────────────────────────────────────────────
const LABELS = {
  ko: {
    dateLabel: '일자',
    settleDateType: '정산일자', tradeDateType: '거래일자',
    today: '오늘', yesterday: '어제', oneMonth: '1개월', threeMonths: '3개월',
    search: '조회',
    channel: '채널', channelName: '채널명', channelInput: '채널명 입력',
    merchant: '고객사', storeName: '상점명', storeId: '상점ID', merchantInput: '상점명/ID 입력',
    status: '상태', all: '전체', payment: '결제', refund: '환불',
    idSearch: 'ID 검색', paymentId: '결제 ID', orderId: '고객사 주문 ID', idInput: 'ID 입력',
    payCurrency: '결제 통화', settleCurrency: '정산 통화',
    // columns
    txType: '거래 유형', tradeDate: '거래일',
    revision: '추출 회차',
    channelCol: '채널', merchantIdCol: '고객사 상점 ID', orderIdCol: '고객사 주문 ID',
    payRefundId: '결제/환불 ID', wltTrdId: '월렛 거래 ID', cnclTrdId: '월렛 취소 ID',
    fxRate: '환율', payAmt: '결제 금액', feeAmt: '수수료', feeCur: '수수료 통화',
    settAmt: '정산 금액',
    payBadge: '결제', refundBadge: '환불',
  },
  en: {
    dateLabel: 'Date',
    settleDateType: 'Settlement Date', tradeDateType: 'Trade Date',
    today: 'Today', yesterday: 'Yesterday', oneMonth: '1 Month', threeMonths: '3 Months',
    search: 'Search',
    channel: 'Channel', channelName: 'Channel Name', channelInput: 'Enter channel',
    merchant: 'Merchant', storeName: 'Store Name', storeId: 'Store ID', merchantInput: 'Enter name/ID',
    status: 'Status', all: 'All', payment: 'Payment', refund: 'Refund',
    idSearch: 'ID Search', paymentId: 'Payment ID', orderId: 'Order ID', idInput: 'Enter ID',
    payCurrency: 'Pay Currency', settleCurrency: 'Settle Currency',
    // columns
    txType: 'Type', tradeDate: 'Trade Date',
    revision: 'Revision',
    channelCol: 'Channel', merchantIdCol: 'Merchant ID', orderIdCol: 'Order ID',
    payRefundId: 'Pay/Refund ID', wltTrdId: 'Wallet Trd ID', cnclTrdId: 'Cancel Trd ID',
    fxRate: 'FX Rate', payAmt: 'Pay Amount', feeAmt: 'Fee', feeCur: 'Fee Currency',
    settAmt: 'Settle Amount',
    payBadge: 'Payment', refundBadge: 'Refund',
  },
};

// ─── Shared panel styles ──────────────────────────────────────────────────────
const LABEL_STYLE = { fontSize: 14, fontWeight: 600, color: '#1A1A1A', whiteSpace: 'nowrap', width: 70, flexShrink: 0 };
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
const compositeSelectStyle = {
  border: 'none', background: 'transparent', fontSize: 14, color: '#303030',
  outline: 'none', cursor: 'pointer', height: '100%', fontFamily: 'inherit',
  flex: 1, minWidth: 0, appearance: 'none', WebkitAppearance: 'none',
  padding: '0 28px 0 12px', backgroundImage: arrowBg,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center',
};
const prefixSelectStyle = {
  border: 'none', background: 'transparent', fontSize: 14, color: '#303030',
  outline: 'none', cursor: 'pointer', height: '100%', fontFamily: 'inherit',
  flexShrink: 0, appearance: 'none', WebkitAppearance: 'none',
  padding: '0 20px 0 12px', backgroundImage: arrowBg,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 4px center',
};
const VDivider = () => <div style={{ width: 1, height: 20, background: '#E9ECF1', flexShrink: 0 }} />;

// ─── Table columns (lang-aware) ───────────────────────────────────────────────
const makeCols = L => [
  { key: 'txType',      label: L.txType,      w: '80px',
    render: r => <Badge variant={r.transaction_type === 'PAYMENT' ? 'payment' : 'refund'}>{r.transaction_type === 'PAYMENT' ? L.payBadge : L.refundBadge}</Badge> },
  { key: 'tradeDate',   label: L.tradeDate,   w: '160px',
    render: r => <div style={{ fontSize: 13, color: T.fg2, whiteSpace: 'nowrap' }}>{r.transaction_date}</div> },
  { key: 'revision',    label: L.revision,    w: '80px',
    render: r => <div style={{ fontSize: 13, color: T.fg2, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{r.revision ?? '—'}</div> },
  { key: 'channel',     label: L.channelCol,  w: '100px',
    render: r => <div style={{ fontSize: 13, color: T.fg2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.channel || '—'}</div> },
  { key: 'merchantId',  label: L.merchantIdCol, w: '140px', render: r => <div style={mono}>{r.client_merchant_id || '—'}</div> },
  { key: 'orderId',     label: L.orderIdCol,  w: '160px', render: r => <div style={mono}>{r.client_order_id || '—'}</div> },
  { key: 'payRefundId', label: L.payRefundId, w: '180px', render: r => <div style={mono}>{r.transaction_payment_id || r.transaction_refund_id || '—'}</div> },
  { key: 'wltTrdId',    label: L.wltTrdId,    w: '160px', render: r => <div style={mono}>{r.wlt_trd_id || '—'}</div> },
  { key: 'cnclTrdId',   label: L.cnclTrdId,   w: '160px', render: r => <div style={mono}>{r.cncl_trd_id || '—'}</div> },
  { key: 'fxRate',      label: L.fxRate,      w: '100px',
    render: r => <div style={{ fontSize: 13, color: T.fg2, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.fx_rate != null ? r.fx_rate.toLocaleString() : '—'}</div> },
  { key: 'payAmt',      label: L.payAmt,      w: '140px', render: r => amtR(r.payment_amount || 0, r.transaction_currency) },
  { key: 'feeAmt',      label: L.feeAmt,      w: '120px', render: r => amtR(r.fee_amount || 0, r.fee_currency, T.fg2) },
  { key: 'feeCur',      label: L.feeCur,      w: '90px',
    render: r => <div style={{ fontSize: 13, color: T.fg3, textAlign: 'center' }}>{r.fee_currency || '—'}</div> },
  { key: 'settAmt',     label: L.settAmt,     w: '140px',
    render: r => (
      <div style={{ fontSize: 13, fontWeight: 600, color: r.settlement_amount < 0 ? T.negative : T.positive, textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
        {r.settlement_amount < 0 ? '−' : ''}{fmt(Math.abs(r.settlement_amount))}<span style={{ fontSize: 11, fontWeight: 400, color: T.fg4, marginLeft: 3 }}>{r.settlement_currency}</span>
      </div>
    )},
];


// ─── Main component ───────────────────────────────────────────────────────────
export default function SettlementDetail({ lang = 'ko' }) {
  const today    = new Date();
  const initFrom = toISO(new Date(today.getFullYear(), today.getMonth() - 3, today.getDate()));
  const initTo   = toISO(today);

  const [dateType,  setDateType]  = useState('정산일자');
  const [dateFrom,  setDateFrom]  = useState(initFrom);
  const [dateTo,    setDateTo]    = useState(initTo);
  const [quickDate, setQuickDate] = useState('3개월');
  const [dateRows,  setDateRows]  = useState(() =>
    SETTLEMENT_ROWS.filter(r => r.transaction_date?.slice(0, 10) >= initFrom && r.transaction_date?.slice(0, 10) <= initTo)
  );

  const [channel,  setChannel]  = useState('');
  const [merchant, setMerchant] = useState('');
  const [mchType,  setMchType]  = useState('상점명');
  const [txStatus, setTxStatus] = useState('all');
  const [idType,   setIdType]   = useState('결제 ID');
  const [idValue,  setIdValue]  = useState('');

  const L = LABELS[lang];

  const quickKeys   = ['오늘', '어제', '1개월', '3개월'];
  const quickLabels = [L.today, L.yesterday, L.oneMonth, L.threeMonths];

  const handleSearch = () => {
    const dateField = dateType === '정산일자' ? 'settlement_date' : 'transaction_date';
    setDateRows(
      SETTLEMENT_ROWS
        .filter(r => {
          const d = (r[dateField] || r.transaction_date || '').slice(0, 10);
          return d >= dateFrom && d <= dateTo;
        })
        .filter(r => txStatus === 'all' || r.transaction_type === txStatus)
        .filter(r => !channel.trim() || r.channel?.toLowerCase().includes(channel.trim().toLowerCase()))
        .filter(r => !merchant.trim() || r.client_merchant_id?.toLowerCase().includes(merchant.trim().toLowerCase()))
        .filter(r => !idValue.trim() || (idType === '결제 ID'
          ? (r.transaction_payment_id || '').includes(idValue.trim())
          : (r.client_order_id || '').includes(idValue.trim())))
    );
  };

  const applyQuick = key => {
    const t  = new Date();
    const td = new Date(t.getFullYear(), t.getMonth(), t.getDate());
    const froms = {
      '오늘':  new Date(t.getFullYear(), t.getMonth(), t.getDate()),
      '어제':  new Date(t.getFullYear(), t.getMonth(), t.getDate() - 1),
      '1개월': new Date(t.getFullYear(), t.getMonth() - 1, t.getDate()),
      '3개월': new Date(t.getFullYear(), t.getMonth() - 3, t.getDate()),
    };
    const tos = { '오늘': td, '어제': new Date(t.getFullYear(), t.getMonth(), t.getDate() - 1), '1개월': td, '3개월': td };
    setQuickDate(key);
    setDateFrom(toISO(froms[key]));
    setDateTo(toISO(tos[key]));
  };

  const cols = useMemo(() => makeCols(L), [lang]);

  return (
    <>
      {/* 통합 필터 패널 */}
      <div style={{ margin: '0 32px 16px', background: '#F9FAFB', borderRadius: 16, border: '1px solid #EAEFF5', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* 날짜 + 조회 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={LABEL_STYLE}>{L.dateLabel}</span>
          <div style={{ ...compositeBox, flex: 'none', width: 300 }}>
            <select value={dateType} onChange={e => setDateType(e.target.value)} style={prefixSelectStyle}>
              <option value="정산일자">{L.settleDateType}</option>
              <option value="거래일자">{L.tradeDateType}</option>
            </select>
            <VDivider />
            <input
              type="date" value={dateFrom} max={dateTo}
              onChange={e => { setDateFrom(e.target.value); setQuickDate(null); }}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: '#1A1A1A', fontFamily: 'inherit', flex: 1, minWidth: 0, height: '100%', cursor: 'pointer', padding: '0 2px 0 8px' }}
            />
            <span style={{ color: '#94A3B8', flexShrink: 0 }}>~</span>
            <input
              type="date" value={dateTo} min={dateFrom}
              onChange={e => { setDateTo(e.target.value); setQuickDate(null); }}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: '#1A1A1A', fontFamily: 'inherit', flex: 1, minWidth: 0, height: '100%', cursor: 'pointer', padding: '0 8px 0 2px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {quickKeys.map((key, i) => {
              const active = quickDate === key;
              return (
                <button key={key} onClick={() => applyQuick(key)} style={{
                  all: 'unset', cursor: 'pointer', height: 32, padding: '0 12px',
                  fontSize: 13, fontWeight: active ? 600 : 400,
                  color: active ? '#FFFFFF' : '#64748B',
                  background: active ? '#303030' : '#FFFFFF',
                  border: `1px solid ${active ? '#303030' : '#E3E6EB'}`,
                  borderRadius: 6, whiteSpace: 'nowrap', boxSizing: 'border-box',
                }}>{quickLabels[i]}</button>
              );
            })}
          </div>
          <div style={{ flex: 1 }} />
          <button
            onClick={handleSearch}
            style={{ all: 'unset', cursor: 'pointer', background: '#303030', color: '#FFFFFF', borderRadius: 6, padding: '9px 28px', fontSize: 14, fontWeight: 600, boxSizing: 'border-box', whiteSpace: 'nowrap' }}
          >
            {L.search}
          </button>
        </div>
        {/* 세부 필터 */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ ...LABEL_STYLE, width: 'auto' }}>{L.channel}</span>
            <div style={{ ...compositeBox, width: 200, marginLeft: 4 }}>
              <span style={{ fontSize: 13, color: '#303030', padding: '0 6px 0 10px', whiteSpace: 'nowrap', flexShrink: 0 }}>{L.channelName}</span>
              <VDivider />
              <input value={channel} onChange={e => setChannel(e.target.value)} placeholder={L.channelInput} style={compositeTextInput} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ ...LABEL_STYLE, width: 'auto', flexShrink: 0 }}>{L.merchant}</span>
            <div style={{ ...compositeBox, width: 220, marginLeft: 4 }}>
              <select value={mchType} onChange={e => setMchType(e.target.value)} style={{ ...prefixSelectStyle, padding: '0 18px 0 10px' }}>
                <option value="상점명">{L.storeName}</option>
                <option value="상점ID">{L.storeId}</option>
              </select>
              <VDivider />
              <input value={merchant} onChange={e => setMerchant(e.target.value)} placeholder={L.merchantInput} style={compositeTextInput} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ ...LABEL_STYLE, width: 'auto', flexShrink: 0 }}>{L.status}</span>
            <select value={txStatus} onChange={e => setTxStatus(e.target.value)}
              style={{ ...plainInput, width: 120, cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none', backgroundImage: arrowBg, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', paddingRight: 28, marginLeft: 4 }}>
              <option value="all">{L.all}</option>
              <option value="PAYMENT">{L.payment}</option>
              <option value="REFUND">{L.refund}</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ ...LABEL_STYLE, width: 'auto', flexShrink: 0 }}>{L.idSearch}</span>
            <div style={{ ...compositeBox, width: 240, marginLeft: 4 }}>
              <select value={idType} onChange={e => setIdType(e.target.value)} style={{ ...prefixSelectStyle, padding: '0 18px 0 10px' }}>
                <option value="결제 ID">{L.paymentId}</option>
                <option value="고객사 주문 ID">{L.orderId}</option>
              </select>
              <VDivider />
              <input value={idValue} onChange={e => setIdValue(e.target.value)} placeholder={L.idInput} style={compositeTextInput} />
            </div>
          </div>

        </div>
      </div>

      <SettlementMetrics rows={SETTLEMENT_SUMMARY} lang={lang} />
      <DataTable rows={dateRows} colKeys={cols.map(c => c.key)} colDefs={cols} />
    </>
  );
}

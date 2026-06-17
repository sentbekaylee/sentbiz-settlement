import { useState, useMemo } from 'react';
import { T, fmt, toISO } from '../../lib/tokens.js';
import { Badge } from '../../lib/primitives.jsx';
import { DataTable, amtR, mono } from '../../lib/table.jsx';
import SettlementMetrics from '../../components/SettlementMetrics.jsx';
import { SETTLEMENT_ROWS, SETTLEMENT_SUMMARY } from '../../data/settlement.js';

// ─── i18n ─────────────────────────────────────────────────────────────────────
const LABELS = {
  ko: {
    doneDateLabel: '거래 완료일시',
    doneDateTip: '결제 완료일시 및 환불 완료일시를 포함합니다',
    today: '오늘', yesterday: '어제', oneMonth: '1개월', threeMonths: '3개월',
    search: '조회',
    channel: '채널', channelName: '채널명', channelNumber: '채널넘버', channelInput: '채널 입력',
    merchant: '고객사 가맹점', storeName: '상점명', storeId: '상점ID', merchantInput: '상점명/ID 입력',
    idSearch: 'ID 검색', orderId: '고객사 주문 ID', paymentId: '결제 ID', refundId: '환불 ID', walletTrdId: '월렛거래ID', idInput: 'ID 입력',
    payCurrency: '결제 통화', settleCurrency: '정산 통화',
    // columns
    txType: '거래 유형', tradeDoneAt: '거래 완료일시',
    revision: '추출 회차',
    channelCol: '채널', merchantIdCol: '고객사 상점 ID', orderIdCol: '고객사 주문 ID',
    paymentIdCol: '결제 ID', refundIdCol: '환불 ID', wltTrdId: '월렛 거래 ID',
    fxRate: '환율', payAmt: '거래 금액', feeAmt: '전체 수수료', vatAmt: '부가세',
    settAmt: '정산 금액',
    payBadge: '결제', refundBadge: '환불',
  },
  en: {
    doneDateLabel: 'Completed At',
    doneDateTip: 'Includes both payment and refund completion timestamps',
    today: 'Today', yesterday: 'Yesterday', oneMonth: '1 Month', threeMonths: '3 Months',
    search: 'Search',
    channel: 'Channel', channelName: 'Channel Name', channelNumber: 'Channel No.', channelInput: 'Enter channel',
    merchant: '고객사 가맹점', storeName: 'Store Name', storeId: 'Store ID', merchantInput: 'Enter name/ID',
    idSearch: 'ID Search', orderId: 'Order ID', paymentId: 'Payment ID', refundId: 'Refund ID', walletTrdId: 'Wallet Trd ID', idInput: 'Enter ID',
    payCurrency: 'Pay Currency', settleCurrency: 'Settle Currency',
    // columns
    txType: 'Type', tradeDoneAt: 'Completed At',
    revision: 'Revision',
    channelCol: 'Channel', merchantIdCol: 'Merchant ID', orderIdCol: 'Order ID',
    paymentIdCol: 'Payment ID', refundIdCol: 'Refund ID', wltTrdId: 'Wallet Trd ID',
    fxRate: 'FX Rate', payAmt: 'Trade Amount', feeAmt: 'Total Fee', vatAmt: 'VAT',
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

// ─── Info tooltip label ───────────────────────────────────────────────────────
const DateLabel = ({ label, tip }) => {
  const [show, setShow] = useState(false);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <span style={{ ...LABEL_STYLE, width: 'auto' }}>{label}</span>
      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'default' }}>
        <div style={{ width: 14, height: 14, background: '#64748B', WebkitMask: '/design_system/assets/icons/Info.svg center/contain no-repeat', mask: 'url(/design_system/assets/icons/Info.svg) center/contain no-repeat' }} />
        {show && (
          <div style={{
            position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)',
            background: '#1E293B', color: '#F8FAFC', fontSize: 12, lineHeight: 1.5,
            borderRadius: 6, padding: '6px 10px', whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.18)', zIndex: 100, pointerEvents: 'none',
          }}>
            {tip}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Table columns (lang-aware) ───────────────────────────────────────────────
const makeCols = (L) => [
  { key: 'txType',      label: L.txType,       w: '80px',
    render: r => <Badge variant={r.transaction_type === 'PAYMENT' ? 'payment' : 'refund'}>{r.transaction_type === 'PAYMENT' ? L.payBadge : L.refundBadge}</Badge> },
  { key: 'tradeDoneAt', label: L.tradeDoneAt,  w: '170px',
    render: r => <div style={{ fontSize: 13, color: T.fg2, whiteSpace: 'nowrap' }}>{r.transaction_date || '—'}</div> },
  { key: 'channel',     label: L.channelCol,  w: '100px',
    render: r => <div style={{ fontSize: 13, color: T.fg2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.channel || '—'}</div> },
  { key: 'merchantId',  label: L.merchantIdCol, w: '140px', render: r => <div style={mono}>{r.client_merchant_id || '—'}</div> },
  { key: 'orderId',     label: L.orderIdCol,  w: '160px', render: r => <div style={mono}>{r.client_order_id || '—'}</div> },
  { key: 'payAmt',      label: L.payAmt,      w: '140px', render: r => amtR(r.payment_amount || 0, r.transaction_currency) },
  { key: 'feeAmt',      label: L.feeAmt,      w: '140px', render: r => amtR(r.fee_amount || 0, r.fee_currency, T.fg2) },
  { key: 'vatAmt',      label: L.vatAmt,      w: '120px', render: r => amtR(r.vat_amount || 0, r.fee_currency, T.fg2) },
  { key: 'settAmt',     label: L.settAmt,     w: '140px',
    render: r => (
      <div style={{ fontSize: 13, fontWeight: 600, color: r.settlement_amount < 0 ? T.negative : T.positive, textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
        {r.settlement_amount < 0 ? '−' : ''}{fmt(Math.abs(r.settlement_amount))}<span style={{ fontSize: 11, fontWeight: 400, color: T.fg4, marginLeft: 3 }}>{r.settlement_currency}</span>
      </div>
    )},
  { key: 'paymentId',   label: L.paymentIdCol, w: '180px', render: r => <div style={mono}>{r.transaction_payment_id || '—'}</div> },
  { key: 'refundId',    label: L.refundIdCol,  w: '180px', render: r => <div style={mono}>{r.transaction_refund_id  || '—'}</div> },
  { key: 'wltTrdId',    label: L.wltTrdId,    w: '160px', render: r => <div style={mono}>{r.wlt_trd_id || '—'}</div> },
  { key: 'fxRate',      label: L.fxRate,      w: '100px',
    render: r => <div style={{ fontSize: 13, color: T.fg2, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.fx_rate != null ? r.fx_rate.toLocaleString() : '—'}</div> },
];


// ─── Main component ───────────────────────────────────────────────────────────
export default function SettlementDetail({ lang = 'ko' }) {
  const today    = new Date();
  const initFrom = toISO(new Date(today.getFullYear(), today.getMonth() - 3, today.getDate()));
  const initTo   = toISO(today);

  const [dateFrom,  setDateFrom]  = useState(initFrom);
  const [dateTo,    setDateTo]    = useState(initTo);
  const [quickDate, setQuickDate] = useState('3개월');
  const [dateRows,  setDateRows]  = useState(() =>
    SETTLEMENT_ROWS.filter(r => r.transaction_date?.slice(0, 10) >= initFrom && r.transaction_date?.slice(0, 10) <= initTo)
  );

  const [channel,  setChannel]  = useState('');
  const [chType,   setChType]   = useState('채널명');
  const [merchant, setMerchant] = useState('');
  const [mchType,  setMchType]  = useState('상점명');
  const [idType,   setIdType]   = useState('고객사 주문 ID');
  const [idValue,  setIdValue]  = useState('');

  const L = LABELS[lang];

  const quickKeys   = ['오늘', '어제', '1개월', '3개월'];
  const quickLabels = [L.today, L.yesterday, L.oneMonth, L.threeMonths];

  const handleSearch = () => {
    setDateRows(
      SETTLEMENT_ROWS
        .filter(r => {
          const d = (r.transaction_date || '').slice(0, 10);
          return d >= dateFrom && d <= dateTo;
        })
        .filter(r => !channel.trim() || (chType === '채널명'
          ? r.channel?.toLowerCase().includes(channel.trim().toLowerCase())
          : (r.channel_id || '').toLowerCase().includes(channel.trim().toLowerCase())))
        .filter(r => !merchant.trim() || r.client_merchant_id?.toLowerCase().includes(merchant.trim().toLowerCase()))
        .filter(r => !idValue.trim() || (() => {
          const v = idValue.trim();
          if (idType === '결제 ID')    return (r.transaction_payment_id || '').includes(v);
          if (idType === '환불 ID')    return (r.transaction_refund_id  || '').includes(v);
          if (idType === '월렛거래ID') return (r.wlt_trd_id             || '').includes(v);
          return (r.client_order_id || '').includes(v);
        })())
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

  const handleDownload = () => {
    const headers = ['거래유형','거래완료일시','채널','채널넘버','고객사상점ID','고객사주문ID','거래금액','거래통화','전체수수료','수수료통화','부가세','정산금액','정산통화','결제ID','환불ID','월렛거래ID','환율'];
    const csvRows = dateRows.map(r => [
      r.transaction_type === 'PAYMENT' ? '결제' : '환불',
      r.transaction_date ?? '', r.channel ?? '', r.channel_id ?? '',
      r.client_merchant_id ?? '', r.client_order_id ?? '',
      r.payment_amount ?? '', r.transaction_currency ?? '',
      r.fee_amount ?? '', r.fee_currency ?? '', r.vat_amount ?? '',
      r.settlement_amount ?? '', r.settlement_currency ?? '',
      r.transaction_payment_id ?? '', r.transaction_refund_id ?? '',
      r.wlt_trd_id ?? '', r.fx_rate ?? '',
    ]);
    const csv = [headers, ...csvRows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `정산건별조회_${dateFrom}_${dateTo}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* 통합 필터 패널 */}
      <div style={{ margin: '0 32px 16px', background: '#F9FAFB', borderRadius: 16, border: '1px solid #EAEFF5', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* 날짜 + 조회 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <DateLabel label={L.doneDateLabel} tip={L.doneDateTip} />
          <div style={{ ...compositeBox, flex: 'none', width: 260 }}>
            <input
              type="date" value={dateFrom} max={dateTo}
              onChange={e => { setDateFrom(e.target.value); setQuickDate(null); }}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: '#1A1A1A', fontFamily: 'inherit', flex: 1, minWidth: 0, height: '100%', cursor: 'pointer', padding: '0 2px 0 12px' }}
            />
            <span style={{ color: '#94A3B8', flexShrink: 0 }}>~</span>
            <input
              type="date" value={dateTo} min={dateFrom}
              onChange={e => { setDateTo(e.target.value); setQuickDate(null); }}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: '#1A1A1A', fontFamily: 'inherit', flex: 1, minWidth: 0, height: '100%', cursor: 'pointer', padding: '0 12px 0 2px' }}
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
            <div style={{ ...compositeBox, width: 220, marginLeft: 4 }}>
              <select value={chType} onChange={e => setChType(e.target.value)} style={{ ...prefixSelectStyle, padding: '0 18px 0 10px' }}>
                <option value="채널명">{L.channelName}</option>
                <option value="채널넘버">{L.channelNumber}</option>
              </select>
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
            <span style={{ ...LABEL_STYLE, width: 'auto', flexShrink: 0 }}>{L.idSearch}</span>
            <div style={{ ...compositeBox, width: 240, marginLeft: 4 }}>
              <select value={idType} onChange={e => setIdType(e.target.value)} style={{ ...prefixSelectStyle, padding: '0 18px 0 10px' }}>
                <option value="고객사 주문 ID">{L.orderId}</option>
                <option value="결제 ID">{L.paymentId}</option>
                <option value="환불 ID">{L.refundId}</option>
                <option value="월렛거래ID">{L.walletTrdId}</option>
              </select>
              <VDivider />
              <input value={idValue} onChange={e => setIdValue(e.target.value)} placeholder={L.idInput} style={compositeTextInput} />
            </div>
          </div>

        </div>
      </div>

      <SettlementMetrics rows={SETTLEMENT_SUMMARY} lang={lang} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '0 32px 10px' }}>
        <button
          onClick={handleDownload}
          style={{ all: 'unset', cursor: 'pointer', background: '#FFFFFF', color: '#303030', border: '1px solid #E3E6EB', borderRadius: 6, padding: '8px 14px', fontSize: 13, fontWeight: 600, boxSizing: 'border-box', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <div style={{ width: 15, height: 15, background: '#303030', WebkitMask: '/design_system/assets/icons/DownloadSimple.svg center/contain no-repeat', mask: 'url(/design_system/assets/icons/DownloadSimple.svg) center/contain no-repeat', flexShrink: 0 }} />
          엑셀 다운로드
        </button>
      </div>
      <DataTable rows={dateRows} colKeys={cols.map(c => c.key)} colDefs={cols} />
    </>
  );
}

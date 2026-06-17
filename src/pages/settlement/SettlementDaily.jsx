import { useState, useMemo } from 'react';
import { T, fmt, toISO, SUMMARY_STATUS_MAP } from '../../lib/tokens.js';
import { Badge } from '../../lib/primitives.jsx';
import { DataTable, amtR } from '../../lib/table.jsx';
import SettlementMetrics from '../../components/SettlementMetrics.jsx';
import { SETTLEMENT_SUMMARY, SETTLEMENT_ROWS } from '../../data/settlement.js';

// ─── i18n ─────────────────────────────────────────────────────────────────────
const LABELS = {
  ko: {
    dateLabel: '정산 일자',
    today: '오늘', yesterday: '어제', oneMonth: '1개월', threeMonths: '3개월',
    search: '조회',
    channel: '채널', channelName: '채널명', channelNo: '채널번호',
    merchant: '고객사 가맹점', merchantName: '가맹점명', merchantId: '가맹점 ID',
    batchStatus: '상태',
    input: '입력',
    all: '전체', ready: '집계완료', confirmed: '확정', paid: '지급완료',
    // columns
    tradeDate: '거래완료일', payDate: '지급예정일', revision: '추출 회차',
    channelCol: '채널', count: '정산 건수', settlementAmt: '정산 금액',
    refundCnt: '환불 건수', refundAmt: '환불 금액', tradeAmt: '거래 금액',
    totalFee: '전체 수수료', vat: '부가세', status: '상태',
    // modal
    modalTitle: '정산 상세',
    close: '닫기', confirm: '확정하기', paidBtn: '지급완료',
    confirmMsg: '정산 내용을 확정하시겠습니까?\n확정 후에는 수정이 불가합니다.',
    paidMsg: '지급 완료 처리하시겠습니까?\n처리 후에는 되돌릴 수 없습니다.',
    cancel: '취소', ok: '확인',
    mTradeDate: '거래완료일', mPayDate: '지급예정일', mChannel: '채널',
    mRevision: '추출 회차', mRevisionSuffix: '회차',
    mClient: '고객사', mMerchantId: '가맹점 ID',
    mCount: '정산 건수', mRefundCnt: '환불 건수',
    mTradeAmt: '거래 금액', mRefundAmt: '환불 금액',
    mTotalFee: '전체 수수료', mVat: '부가세', mSettleAmt: '정산 금액',
    paidAt: '지급 완료',
  },
  en: {
    dateLabel: 'Settlement Date',
    today: 'Today', yesterday: 'Yesterday', oneMonth: '1 Month', threeMonths: '3 Months',
    search: 'Search',
    channel: 'Channel', channelName: 'Channel Name', channelNo: 'Channel No.',
    merchant: 'Merchant', merchantName: 'Merchant Name', merchantId: 'Merchant ID',
    batchStatus: 'Status',
    input: 'Search',
    all: 'All', ready: 'Aggregated', confirmed: 'Confirmed', paid: 'Paid',
    // columns
    tradeDate: 'Trade Date', payDate: 'Pay Date', revision: 'Revision',
    channelCol: 'Channel', count: 'Count', settlementAmt: 'Settlement Amt',
    refundCnt: 'Refund Cnt', refundAmt: 'Refund Amt', tradeAmt: 'Trade Amt',
    totalFee: 'Total Fee', vat: 'VAT', status: 'Status',
    // modal
    modalTitle: 'Settlement Detail',
    close: 'Close', confirm: 'Confirm', paidBtn: 'Mark as Paid',
    confirmMsg: 'Confirm this settlement?\nThis cannot be undone.',
    paidMsg: 'Mark as paid?\nThis cannot be undone.',
    cancel: 'Cancel', ok: 'OK',
    mTradeDate: 'Trade Date', mPayDate: 'Payment Date', mChannel: 'Channel',
    mRevision: 'Revision', mRevisionSuffix: '',
    mClient: 'Merchant', mMerchantId: 'Merchant ID',
    mCount: 'Count', mRefundCnt: 'Refund Count',
    mTradeAmt: 'Trade Amount', mRefundAmt: 'Refund Amount',
    mTotalFee: 'Total Fee', mVat: 'VAT', mSettleAmt: 'Settlement Amount',
    paidAt: 'Paid at',
  },
};

// ─── Shared panel styles ──────────────────────────────────────────────────────
const LABEL_STYLE = { fontSize: 14, fontWeight: 600, color: '#1A1A1A', whiteSpace: 'nowrap', width: 70, flexShrink: 0 };
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

// ─── Detail modal ─────────────────────────────────────────────────────────────
function SettlementDailyModal({ row, onClose, onConfirm, onPaid, L }) {
  const [confirmType, setConfirmType] = useState(null);
  if (!row) return null;

  const statusInfo = SUMMARY_STATUS_MAP[row.status] || { label: row.status, v: 'neutral' };

  const InfoRow = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #F1F5F9' }}>
      <span style={{ fontSize: 13, color: T.fg3 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: T.fg1 }}>{value || '—'}</span>
    </div>
  );

  const AmtRow = ({ label, value, cur, accent, bold }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0' }}>
      <span style={{ fontSize: 13, color: bold ? T.fg1 : T.fg3, fontWeight: bold ? 700 : 400 }}>{label}</span>
      <span style={{ fontSize: bold ? 16 : 13, fontWeight: bold ? 700 : 600, color: accent || T.fg1, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
        {fmt(value)}<span style={{ fontSize: 11, fontWeight: 400, color: T.fg4, marginLeft: 3 }}>{cur}</span>
      </span>
    </div>
  );

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div
        style={{ background: '#FFFFFF', borderRadius: 16, width: 520, maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.22)', position: 'relative' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid #F1F5F9', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: T.fg1 }}>{L.modalTitle}</span>
            <Badge variant={statusInfo.v}>{statusInfo.label}</Badge>
          </div>
          <button onClick={onClose} style={{ all: 'unset', cursor: 'pointer', color: T.fg4, fontSize: 18, lineHeight: '24px', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}>✕</button>
        </div>

        <div style={{ padding: '4px 24px 24px' }}>
          <div style={{ padding: '12px 0 8px' }}>
            <span style={{ fontSize: 11, color: T.fg4, fontFamily: 'ui-monospace,monospace', letterSpacing: '0.04em' }}>{row.id}</span>
          </div>

          <div style={{ marginBottom: 16 }}>
            <InfoRow label={L.mTradeDate} value={row.target_date} />
            <InfoRow label={L.mPayDate}   value={row.expected_paid_date} />
            <InfoRow label={L.mChannel}   value={row.channel} />
            <InfoRow label={L.mRevision}  value={`${row.revision}${L.mRevisionSuffix}`} />
            <InfoRow label={L.mClient}    value={`${row.client_name}  ·  ${row.client_id}`} />
            <InfoRow label={L.mMerchantId} value={row.client_merchant_id} />
            <InfoRow label={L.mCount}     value={`${row.total_count}건`} />
            {row.refund_count > 0 && (
              <InfoRow label={L.mRefundCnt} value={`${row.refund_count}건`} />
            )}
          </div>

          <div style={{ background: '#F8FAFC', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
            <AmtRow label={L.mTradeAmt}  value={row.total_payment_amount} cur={row.currency} />
            {row.total_refund_amount > 0 && (
              <AmtRow label={L.mRefundAmt} value={row.total_refund_amount} cur={row.currency} accent={T.negative} />
            )}
            <AmtRow label={L.mTotalFee}  value={row.total_fee_amount} cur={row.currency} accent={T.fg3} />
            <div style={{ height: 1, background: '#E2E8F0', margin: '8px 0' }} />
            <AmtRow label={L.mSettleAmt} value={row.settlement_amount} cur={row.settlement_currency || row.currency} accent={T.positive} bold />
          </div>

          {row.status === 'PAID' && row.paid_at && (
            <div style={{ textAlign: 'center', fontSize: 12, color: T.fg4, marginBottom: 20 }}>
              {L.paidAt}: <b style={{ color: T.positive }}>{row.paid_at}</b>
            </div>
          )}

          {confirmType && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
              <div style={{ background: '#FFF', borderRadius: 12, padding: '24px', width: 300, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
                <div style={{ fontSize: 14, color: T.fg1, lineHeight: 1.6, whiteSpace: 'pre-line', marginBottom: 20 }}>
                  {confirmType === 'confirm' ? L.confirmMsg : L.paidMsg}
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button onClick={() => setConfirmType(null)} style={{ all: 'unset', cursor: 'pointer', border: `1px solid ${T.borderDefault}`, borderRadius: 6, padding: '8px 20px', fontSize: 14, color: T.fg2, boxSizing: 'border-box' }}>
                    {L.cancel}
                  </button>
                  <button
                    onClick={() => {
                      if (confirmType === 'confirm') {
                        onConfirm(row.id);
                        setConfirmType(null);
                      } else {
                        onPaid(row.id);
                        setConfirmType(null);
                      }
                    }}
                    style={{ all: 'unset', cursor: 'pointer', background: T.primaryHeavy, borderRadius: 6, padding: '8px 20px', fontSize: 14, fontWeight: 600, color: '#FFF', boxSizing: 'border-box' }}
                  >
                    {L.ok}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{ all: 'unset', cursor: 'pointer', border: `1px solid ${T.borderDefault}`, borderRadius: 6, padding: '10px 24px', fontSize: 14, color: T.fg2, boxSizing: 'border-box' }}>
              {L.close}
            </button>
            {row.status === 'READY' && (
              <button
                onClick={() => setConfirmType('confirm')}
                style={{ all: 'unset', cursor: 'pointer', border: `1px solid ${T.primaryHeavy}`, borderRadius: 6, padding: '10px 24px', fontSize: 14, fontWeight: 600, color: T.primaryHeavy, boxSizing: 'border-box' }}
              >
                {L.confirm}
              </button>
            )}
            {row.status === 'CONFIRMED' && (
              <button
                onClick={() => setConfirmType('paid')}
                style={{ all: 'unset', cursor: 'pointer', background: T.primaryHeavy, borderRadius: 6, padding: '10px 24px', fontSize: 14, fontWeight: 600, color: '#FFFFFF', boxSizing: 'border-box' }}
              >
                {L.paidBtn}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Table columns (lang-aware) ───────────────────────────────────────────────
const txt = v => (
  <div style={{ fontSize: 13, color: T.fg2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
    {v || '—'}
  </div>
);

const makeCols = (L, onDownload) => [
  { key: 'download', label: '', w: '48px',
    render: r => (
      <button
        onClick={e => { e.stopPropagation(); onDownload(r); }}
        title="엑셀 다운로드"
        style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 6, border: '1px solid #E3E6EB', background: '#FFF' }}
      >
        <div style={{ width: 16, height: 16, background: T.fg3, WebkitMask: '/design_system/assets/icons/DownloadSimple.svg center/contain no-repeat', mask: 'url(/design_system/assets/icons/DownloadSimple.svg) center/contain no-repeat' }} />
      </button>
    )},
  { key: 'tradeDate',   label: L.tradeDate,     w: '120px', sortable: true,
    render: r => <div style={{ fontSize: 13, fontWeight: 700, color: T.fg1, whiteSpace: 'nowrap' }}>{r.target_date}</div> },
  { key: 'payDate',     label: L.payDate,        w: '120px',
    render: r => <div style={{ fontSize: 13, color: T.fg2, whiteSpace: 'nowrap' }}>{r.expected_paid_date}</div> },
  { key: 'status',     label: L.status,           w: '100px',
    render: r => <Badge variant={SUMMARY_STATUS_MAP[r.status]?.v || 'neutral'}>{SUMMARY_STATUS_MAP[r.status]?.label || r.status}</Badge> },
  { key: 'revision',   label: L.revision,        w: '80px',
    render: r => <div style={{ fontSize: 13, color: T.fg2, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{r.revision}</div> },
  { key: 'channel',    label: L.channelCol,       w: '120px', render: r => txt(r.channel) },
  { key: 'count',      label: L.count,            w: '80px',
    render: r => <div style={{ fontSize: 13, color: T.fg2, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.total_count}건</div> },
  { key: 'settlementAmt', label: L.settlementAmt, w: '150px',
    render: r => amtR(r.settlement_amount, r.currency,
      r.status === 'PAID' ? T.positive : r.status === 'CONFIRMED' ? '#F97316' : '#1890FF') },
  { key: 'refundCnt',  label: L.refundCnt,        w: '80px',
    render: r => <div style={{ fontSize: 13, color: r.refund_count ? T.negative : T.fg4, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.refund_count ? `${r.refund_count}건` : '—'}</div> },
  { key: 'refundAmt',  label: L.refundAmt,        w: '150px',
    render: r => r.total_refund_amount ? amtR(r.total_refund_amount, r.currency, T.negative) : <div style={{ fontSize: 13, color: T.fg4, textAlign: 'right' }}>—</div> },
  { key: 'tradeAmt',   label: L.tradeAmt,         w: '150px', render: r => amtR(r.total_payment_amount, r.currency) },
  { key: 'totalFee',   label: L.totalFee,         w: '130px', render: r => amtR(r.total_fee_amount, r.currency, T.fg2) },
  { key: 'vat',        label: L.vat,              w: '110px', render: r => amtR(r.vat_amount, r.currency, T.fg3) },
];


// ─── Main component ───────────────────────────────────────────────────────────
export default function SettlementDaily({ lang = 'ko' }) {
  const today    = new Date();
  const initFrom = toISO(new Date(today.getFullYear(), today.getMonth() - 3, today.getDate()));
  const initTo   = toISO(today);

  const [dateFrom,  setDateFrom]  = useState(initFrom);
  const [dateTo,    setDateTo]    = useState(initTo);
  const [quickDate, setQuickDate] = useState('3개월');
  const [dateRows,  setDateRows]  = useState(() =>
    SETTLEMENT_SUMMARY.filter(r => r.target_date >= initFrom && r.target_date <= initTo)
  );

  const [channel, setChannel] = useState('');
  const [chType,  setChType]  = useState('채널명');
  const [status,  setStatus]  = useState('all');

  // 상세 모달
  const [selectedId, setSelectedId] = useState(null);

  const L = LABELS[lang];

  const quickLabels = [L.today, L.yesterday, L.oneMonth, L.threeMonths];
  const quickKeys   = ['오늘', '어제', '1개월', '3개월'];

  const handleSearch = () => {
    setDateRows(
      SETTLEMENT_SUMMARY
        .filter(r => r.target_date >= dateFrom && r.target_date <= dateTo)
        .filter(r => status === 'all' || r.status === status)
        .filter(r => !channel.trim() || r.channel?.toLowerCase().includes(channel.trim().toLowerCase()))
    );
  };

  const applyQuick = (label, key) => {
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

  const handleConfirm = id => setDateRows(prev => prev.map(r => r.id === id ? { ...r, status: 'CONFIRMED' } : r));
  const handlePaid    = id => setDateRows(prev => prev.map(r => r.id === id ? { ...r, status: 'PAID', paid_at: '2026-03-27 10:00' } : r));

  const downloadBatch = row => {
    const batchRows = SETTLEMENT_ROWS.filter(r =>
      r.settlement_date === row.target_date && r.client_merchant_id === row.client_merchant_id
    );
    const headers = ['거래유형','거래완료일시','채널','채널넘버','고객사상점ID','고객사주문ID','거래금액','거래통화','전체수수료','수수료통화','부가세','정산금액','정산통화','결제ID','환불ID','월렛거래ID','환율'];
    const csvRows = batchRows.map(r => [
      r.transaction_type === 'PAYMENT' ? '결제' : '환불',
      r.transaction_date ?? '',
      r.channel ?? '',
      r.channel_id ?? '',
      r.client_merchant_id ?? '',
      r.client_order_id ?? '',
      r.payment_amount ?? '',
      r.transaction_currency ?? '',
      r.fee_amount ?? '',
      r.fee_currency ?? '',
      r.vat_amount ?? '',
      r.settlement_amount ?? '',
      r.settlement_currency ?? '',
      r.transaction_payment_id ?? '',
      r.transaction_refund_id ?? '',
      r.wlt_trd_id ?? '',
      r.fx_rate ?? '',
    ]);
    const csv = [headers, ...csvRows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `정산배치_${row.target_date}_${row.client_merchant_id}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  // 같은 배치(날짜+채널+고객사)에서 최고 회차만 표시
  const finalRows = useMemo(() => {
    const maxRev = {};
    dateRows.forEach(r => {
      const k = `${r.target_date}||${r.channel}||${r.client_id}`;
      if (!maxRev[k] || r.revision > maxRev[k]) maxRev[k] = r.revision;
    });
    return dateRows.filter(r => {
      const k = `${r.target_date}||${r.channel}||${r.client_id}`;
      return r.revision === maxRev[k];
    });
  }, [dateRows]);

  const modalRow = selectedId ? (dateRows?.find(r => r.id === selectedId) ?? null) : null;
  const cols     = useMemo(() => makeCols(L, downloadBatch), [lang]);

  return (
    <>
      <SettlementDailyModal
        row={modalRow}
        onClose={() => setSelectedId(null)}
        onConfirm={handleConfirm}
        onPaid={handlePaid}
        L={L}
      />

      {/* 통합 필터 패널 */}
      <div style={{ margin: '0 32px 16px', background: '#F9FAFB', borderRadius: 16, border: '1px solid #EAEFF5', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <span style={LABEL_STYLE}>{L.dateLabel}</span>
        <div style={{ ...compositeBox, flex: 'none', width: 260 }}>
          <input
            type="date" value={dateFrom} max={dateTo}
            onChange={e => { setDateFrom(e.target.value); setQuickDate(null); }}
            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: '#1A1A1A', fontFamily: 'inherit', flex: 1, minWidth: 0, height: '100%', cursor: 'pointer', padding: '0 4px 0 12px' }}
          />
          <span style={{ color: '#94A3B8', padding: '0 4px', flexShrink: 0 }}>~</span>
          <input
            type="date" value={dateTo} min={dateFrom}
            onChange={e => { setDateTo(e.target.value); setQuickDate(null); }}
            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: '#1A1A1A', fontFamily: 'inherit', flex: 1, minWidth: 0, height: '100%', cursor: 'pointer', padding: '0 12px 0 4px' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {quickLabels.map((label, i) => {
            const active = quickDate === quickKeys[i];
            return (
              <button key={quickKeys[i]} onClick={() => applyQuick(label, quickKeys[i])} style={{
                all: 'unset', cursor: 'pointer', height: 32, padding: '0 12px',
                fontSize: 13, fontWeight: active ? 600 : 400,
                color: active ? '#FFFFFF' : '#64748B',
                background: active ? '#303030' : '#FFFFFF',
                border: `1px solid ${active ? '#303030' : '#E3E6EB'}`,
                borderRadius: 6, whiteSpace: 'nowrap', boxSizing: 'border-box',
              }}>{label}</button>
            );
          })}
        </div>

        <div style={{ width: 1, height: 20, background: '#D1D9E0', flexShrink: 0 }} />

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ ...LABEL_STYLE, width: 'auto' }}>{L.channel}</span>
          <div style={{ ...compositeBox, width: 200, marginLeft: 4 }}>
            <select value={chType} onChange={e => setChType(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: 13, color: '#303030', outline: 'none', cursor: 'pointer', height: '100%', fontFamily: 'inherit', flexShrink: 0, appearance: 'none', WebkitAppearance: 'none', padding: '0 18px 0 10px', backgroundImage: arrowBg, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 4px center' }}>
              <option>{L.channelName}</option>
              <option>{L.channelNo}</option>
            </select>
            <VDivider />
            <input value={channel} onChange={e => setChannel(e.target.value)} placeholder={L.input} style={compositeTextInput} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ ...LABEL_STYLE, width: 'auto', flexShrink: 0 }}>{L.batchStatus}</span>
          <select value={status} onChange={e => setStatus(e.target.value)}
            style={{ ...plainInput, width: 130, cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none', backgroundImage: arrowBg, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', paddingRight: 28, marginLeft: 4 }}>
            <option value="all">{L.all}</option>
            <option value="READY">{L.ready}</option>
            <option value="CONFIRMED">{L.confirmed}</option>
            <option value="PAID">{L.paid}</option>
          </select>
        </div>

        <div style={{ flex: 1 }} />
        <button
          onClick={handleSearch}
          style={{ all: 'unset', cursor: 'pointer', background: '#303030', color: '#FFFFFF', borderRadius: 6, padding: '9px 28px', fontSize: 14, fontWeight: 600, boxSizing: 'border-box', whiteSpace: 'nowrap' }}
        >
          {L.search}
        </button>
      </div>

      <SettlementMetrics rows={dateRows} lang={lang} />
      <DataTable
        rows={finalRows}
        colKeys={cols.map(c => c.key)}
        colDefs={cols}
        showToolbar
        onRowClick={r => setSelectedId(r.id)}
      />
    </>
  );
}

import { useState } from 'react';
import { T, fmt } from '../lib/tokens.js';
import { Icon } from '../lib/icons.jsx';

const METRIC_LABELS = {
  ko: {
    title: '정산 현황', sub: '기간 기준 집계',
    totalAmt:     { label: '총 거래 금액',      tip: '조회 기간 내 발생한 결제 건의 거래 금액 합계' },
    totalSettled: { label: '총 정산 완료 금액',  tip: '지급 처리가 완료된 정산 금액 합계' },
    confirmed:    { label: '확정 금액',          tip: '정산 내용이 확정되어 지급 대기 중인 금액' },
    ready:        { label: '집계완료 금액',       tip: '배치 추출이 완료되어 확정 검토 중인 금액' },
    fee: '전체 수수료',
  },
  en: {
    title: 'Settlement Summary', sub: 'Period aggregate',
    totalAmt:     { label: 'Total Trade Amount',    tip: 'Sum of trade amounts for payments in the selected period' },
    totalSettled: { label: 'Total Settled Amount',  tip: 'Sum of settlement amounts that have been paid out' },
    confirmed:    { label: 'Confirmed Amount',       tip: 'Settlement confirmed and awaiting payout' },
    ready:        { label: 'Aggregated Amount',      tip: 'Batch extracted and pending confirmation' },
    fee: 'Total Fee',
  },
};

export default function SettlementMetrics({ rows, lang = 'ko' }) {
  const L = METRIC_LABELS[lang] ?? METRIC_LABELS.ko;

  const totalPayAmt = rows.reduce((s, r) => s + r.total_payment_amount, 0);
  const totalPayCnt = rows.reduce((s, r) => s + r.total_count, 0);
  const paidAmt     = rows.filter(r => r.status === 'PAID').reduce((s, r) => s + r.settlement_amount, 0);
  const paidCnt     = rows.filter(r => r.status === 'PAID').reduce((s, r) => s + r.total_count, 0);
  const confAmt     = rows.filter(r => r.status === 'CONFIRMED').reduce((s, r) => s + r.settlement_amount, 0);
  const confCnt     = rows.filter(r => r.status === 'CONFIRMED').reduce((s, r) => s + r.total_count, 0);
  const readyAmt    = rows.filter(r => r.status === 'READY').reduce((s, r) => s + r.settlement_amount, 0);
  const readyCnt    = rows.filter(r => r.status === 'READY').reduce((s, r) => s + r.total_count, 0);
  const totalFeeAmt = rows.reduce((s, r) => s + r.total_fee_amount, 0);

  const D = () => <div style={{ width: 1, alignSelf: 'stretch', background: T.borderDefault, flexShrink: 0, margin: '8px 0' }} />;

  const InfoTip = ({ tip }) => {
    const [show, setShow] = useState(false);
    return (
      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
        onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
        <Icon name="Info" size={13} color={T.fg4} />
        {show && (
          <div style={{
            position: 'absolute', bottom: 'calc(100% + 6px)', right: 0,
            background: '#1E293B', color: '#F8FAFC', fontSize: 12, lineHeight: 1.5,
            borderRadius: 6, padding: '6px 10px', whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.18)', zIndex: 100, pointerEvents: 'none',
          }}>
            {tip}
          </div>
        )}
      </div>
    );
  };

  const Metric = ({ def, value, sub, accent }) => {
    const label = typeof def === 'string' ? def : def.label;
    const tip   = typeof def === 'string' ? null : def.tip;
    return (
      <div style={{ flex: 1, padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ fontSize: 12, color: T.fg3, whiteSpace: 'nowrap' }}>{label}</div>
          {tip && <InfoTip tip={tip} />}
        </div>
        {sub && <div style={{ fontSize: 12, fontWeight: 600, color: accent || T.fg3, whiteSpace: 'nowrap' }}>{sub}</div>}
        <div style={{ fontSize: 18, fontWeight: 700, color: accent || T.fg1, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{value}</div>
      </div>
    );
  };

  const KRW = ({ n }) => <>{fmt(n)}<span style={{ fontSize: 11, fontWeight: 400, color: T.fg4, marginLeft: 4 }}>KRW</span></>;

  return (
    <div style={{ margin: '0 32px 20px', background: T.bg, borderRadius: 12, padding: '16px 20px', boxShadow: '0 2px 8px 0 rgba(15,23,42,0.08)', display: 'flex', alignItems: 'center', gap: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingRight: 20, flexShrink: 0 }}>
        <div style={{ width: 36, height: 36, background: '#F0FDF4', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="TrendUp" size={20} color={T.positive} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.fg1 }}>{L.title}</div>
          <div style={{ fontSize: 11, color: T.fg3, marginTop: 2, whiteSpace: 'nowrap' }}>{L.sub}</div>
        </div>
      </div>
      <D />
      <Metric def={L.totalAmt}     value={<KRW n={totalPayAmt} />} sub={`${totalPayCnt}건`} />
      <D />
      <Metric def={L.totalSettled} value={<KRW n={paidAmt} />}    sub={`${paidCnt}건`}     accent={T.positive} />
      <D />
      <Metric def={L.confirmed}    value={<KRW n={confAmt} />}    sub={`${confCnt}건`}     accent="#F97316" />
      <D />
      <Metric def={L.ready}        value={<KRW n={readyAmt} />}   sub={`${readyCnt}건`}    accent={T.progress} />
      <D />
      <Metric def={L.fee} value={<KRW n={totalFeeAmt} />} />
    </div>
  );
}

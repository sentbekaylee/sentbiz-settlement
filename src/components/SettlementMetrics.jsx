import { T, fmt } from '../lib/tokens.js';
import { Icon } from '../lib/icons.jsx';

const METRIC_LABELS = {
  ko: {
    title: '정산 현황', sub: '기간 기준 집계',
    totalAmt: '총 거래 금액', totalSettled: '총 정산 완료',
    confirmed: '확정', ready: '집계완료',
    fee: '전체 수수료',
  },
  en: {
    title: 'Settlement Summary', sub: 'Period aggregate',
    totalAmt: 'Total Trade Amount', totalSettled: 'Total Settled',
    confirmed: 'Confirmed', ready: 'Aggregated',
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
  const totalVatAmt = rows.reduce((s, r) => s + r.vat_amount, 0);

  const D = () => <div style={{ width: 1, alignSelf: 'stretch', background: T.borderDefault, flexShrink: 0, margin: '8px 0' }} />;

  const Metric = ({ label, value, sub, accent }) => (
    <div style={{ flex: 1, padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
      <div style={{ fontSize: 12, color: T.fg3, whiteSpace: 'nowrap' }}>{label}</div>
      {sub && <div style={{ fontSize: 12, fontWeight: 600, color: accent || T.fg3, whiteSpace: 'nowrap' }}>{sub}</div>}
      <div style={{ fontSize: 18, fontWeight: 700, color: accent || T.fg1, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{value}</div>
    </div>
  );

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
      <Metric label={L.totalAmt}     value={<KRW n={totalPayAmt} />} sub={`${totalPayCnt}건`} />
      <D />
      <Metric label={L.totalSettled} value={<KRW n={paidAmt} />}    sub={`${paidCnt}건`}     accent={T.positive} />
      <D />
      <Metric label={L.confirmed}    value={<KRW n={confAmt} />}    sub={`${confCnt}건`}     accent="#F97316" />
      <D />
      <Metric label={L.ready}        value={<KRW n={readyAmt} />}   sub={`${readyCnt}건`}    accent={T.progress} />
      <D />
      <Metric label={L.fee} value={<KRW n={totalFeeAmt} />} />
    </div>
  );
}

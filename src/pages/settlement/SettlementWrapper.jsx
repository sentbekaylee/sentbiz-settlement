import { T } from '../../lib/tokens.js';
import SettlementDaily from './SettlementDaily.jsx';
import SettlementDetail from './SettlementDetail.jsx';
import PaymentRefund from '../payment/PaymentRefund.jsx';

const TABS = [
  { key: 'settlement-daily',  label: '정산 일자별 조회' },
  { key: 'settlement-detail', label: '정산 건별 조회' },
];

const PAGE_TITLES = {
  payment:            '결제 환불 내역',
  'settlement-daily': '정산 일자별 조회',
  'settlement-detail':'정산 건별 조회',
};

export default function SettlementWrapper({ active, onNavigate }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ background: T.bg, borderBottom: `1px solid ${T.surfaceHeavy}`, padding: '0 32px', display: 'flex', gap: 0, flexShrink: 0 }}>
        {TABS.map(tab => {
          const isActive = tab.key === active;
          return (
            <button key={tab.key} onClick={() => onNavigate(tab.key)} style={{
              all: 'unset', cursor: 'pointer', padding: '0 4px', marginRight: 24, height: 48,
              fontSize: 14, fontWeight: isActive ? 700 : 500,
              color: isActive ? T.primaryHeavy : T.fg3,
              borderBottom: isActive ? `2px solid ${T.primaryHeavy}` : '2px solid transparent',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}>
              {tab.label}
            </button>
          );
        })}
      </div>

      <div style={{ padding: '20px 32px 16px', flexShrink: 0 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: T.fg1, margin: 0 }}>
          {PAGE_TITLES[active] ?? ''}
        </h1>
      </div>

      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 32 }}>
        {active === 'payment'            && <PaymentRefund />}
        {active === 'settlement-daily'   && <SettlementDaily />}
        {active === 'settlement-detail'  && <SettlementDetail />}
      </div>
    </div>
  );
}

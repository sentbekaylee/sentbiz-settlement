import { T, fmt, STATUS_MAP } from '../../lib/tokens.js';
import { Icon } from '../../lib/icons.jsx';
import { Badge } from '../../lib/primitives.jsx';

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 24 }}>
    <div style={{ fontSize: 13, fontWeight: 700, color: T.fg3, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12, borderBottom: `1px solid ${T.surfaceHeavy}`, paddingBottom: 8 }}>
      {title}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
      {children}
    </div>
  </div>
);

const Field = ({ label, value, full, mono: isMono }) => (
  <div style={{ gridColumn: full ? '1 / -1' : undefined }}>
    <div style={{ fontSize: 11, color: T.fg4, marginBottom: 3 }}>{label}</div>
    <div style={{ fontSize: 13, color: T.fg1, fontFamily: isMono ? 'ui-monospace,monospace' : 'inherit', wordBreak: 'break-all' }}>{value || '—'}</div>
  </div>
);

export default function PaymentDetailModal({ row, onClose }) {
  if (!row) return null;

  const v = STATUS_MAP[row.status]?.v || 'neutral';

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(15,23,42,0.45)', display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 560, height: '100%', background: T.bg, boxShadow: '-4px 0 24px rgba(15,23,42,0.15)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ height: 60, flexShrink: 0, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${T.surfaceHeavy}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: T.fg1 }}>결제 상세</span>
            <Badge variant={v}>{row.status}</Badge>
          </div>
          <button onClick={onClose} style={{ all: 'unset', cursor: 'pointer', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}>
            <Icon name="X" size={18} color={T.fg3} />
          </button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          <Section title="기본 정보">
            <Field label="고객사 주문 ID"   value={row.client_order_id} mono />
            <Field label="Session ID"        value={row.session_id} mono />
            <Field label="External ID"       value={row.external_id} mono />
            <Field label="고객사"            value={row.client_display} />
            <Field label="채널"              value={row.channel_display} />
            <Field label="상점"              value={row.merchant_display} />
            <Field label="파트너"            value={row.partner_name} />
            <Field label="결제일시"          value={row.payment_date} />
            <Field label="만료일시"          value={row.expires_at} />
            <Field label="최종 업데이트"     value={row.updated_at} />
            <Field label="결제 URL"          value={row.payment_url} full mono />
          </Section>

          <Section title="구매자 정보">
            <Field label="구매자"            value={row.buyer_display} />
            <Field label="연락처"            value={row.buyer_phone} />
            <Field label="주소"              value={row.buyer_address} full />
          </Section>

          <Section title="금액 정보">
            <Field label="요청 금액"         value={row.request_amount ? `${fmt(row.request_amount)} ${row.request_currency}` : '—'} />
            <Field label="파트너 금액"       value={row.partner_amount ? `${fmt(row.partner_amount)} ${row.partner_currency}` : '—'} />
            <Field label="완료 금액"         value={row.completed_amount ? `${fmt(row.completed_amount)} ${row.completed_currency}` : '—'} />
            <Field label="수취 금액"         value={row.receive_amount ? `${fmt(row.receive_amount)} ${row.receive_currency}` : '—'} />
            <Field label="요청 환율"         value={row.fx_rate_req} />
            <Field label="수취 환율"         value={row.fx_rate_recv} />
            {row.crypto_currency && <Field label="암호화폐" value={`${row.crypto_amount} ${row.crypto_currency}`} />}
            <Field label="센트비 수수료율"   value={row.sentbiz_fee_rate ? `${row.sentbiz_fee_rate}%` : '—'} />
            <Field label="센트비 수수료"     value={row.sentbiz_fee_amount ? `${fmt(row.sentbiz_fee_amount)} ${row.fee_currency}` : '—'} />
            <Field label="채널 수수료율"     value={row.channel_fee_rate ? `${row.channel_fee_rate}%` : '—'} />
            <Field label="채널 수수료"       value={row.channel_fee_amount ? `${fmt(row.channel_fee_amount)} ${row.fee_currency}` : '—'} />
            {row.wallet_address && <Field label="지갑 주소" value={row.wallet_address} full mono />}
          </Section>

          {row.refunds?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.fg3, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12, borderBottom: `1px solid ${T.surfaceHeavy}`, paddingBottom: 8 }}>
                환불 내역 ({row.refunds.length}건)
              </div>
              {row.refunds.map((rf, i) => (
                <div key={rf.refund_id} style={{ background: T.surfaceNormal, borderRadius: 8, padding: '12px 16px', marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 12, fontFamily: 'ui-monospace,monospace', color: T.fg3 }}>{rf.refund_id}</span>
                    <Badge variant={rf.refund_status === '성공' ? 'positive' : 'negative'}>{rf.refund_status}</Badge>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
                    <Field label="유형"       value={rf.refund_type} />
                    <Field label="환불 금액"  value={`${fmt(rf.refund_amount)} ${rf.refund_currency}`} />
                    <Field label="환불일시"   value={rf.refund_date} />
                    <Field label="완료일시"   value={rf.completed_at || '—'} />
                    <Field label="사유"       value={rf.reason} full />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

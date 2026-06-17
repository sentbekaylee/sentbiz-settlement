import { useState } from 'react';
import { T, selectBase, fmt } from './tokens.js';
import { Icon, IconBtn } from './icons.jsx';
import { Button } from './primitives.jsx';

export const amtR = (val, cur, accent) => val
  ? <div style={{ fontSize: 13, fontWeight: 600, color: accent || T.fg1, textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
      {fmt(val)}<span style={{ fontSize: 11, fontWeight: 400, color: T.fg4, marginLeft: 3 }}>{cur}</span>
    </div>
  : <div style={{ fontSize: 13, color: T.fg4, textAlign: 'right' }}>—</div>;

export const mono = { fontFamily: 'ui-monospace,monospace', fontSize: 12, color: T.fg3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };

export const DataTable = ({ rows, colKeys, colDefs, onRowClick, showToolbar = false }) => {
  const [pageSize, setPageSize] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);

  const cols = colDefs.filter(c => colKeys.includes(c.key));
  const grid = cols.map(c => c.w).join(' ');
  const pagedRows = showToolbar ? rows.slice((currentPage - 1) * pageSize, currentPage * pageSize) : rows;

  const pgNums = () => {
    const total = Math.ceil(rows.length / pageSize);
    const start = Math.max(1, currentPage - 4);
    const end   = Math.min(total, start + 9);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <div style={{ margin: '0 32px 32px' }}>
      {showToolbar && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0 12px' }}>
          <span style={{ fontSize: 13, color: T.fg3 }}>총 <b style={{ color: T.fg1, fontWeight: 700 }}>{rows.length}</b>개</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Button type="line" usage="tertiary" size="sm">
              <Icon name="DownloadSimple" size={14} color={T.primaryHeavy} />엑셀 다운로드
            </Button>
            <select style={{ ...selectBase, height: 36, fontSize: 13, width: 80 }} value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}>
              {[10, 30, 50, 100].map(n => <option key={n} value={n}>{n}건</option>)}
            </select>
          </div>
        </div>
      )}
      <div style={{ background: T.bg, border: `1px solid ${T.surfaceHeavy}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: cols.length * 85 }}>
            <div style={{ display: 'grid', gridTemplateColumns: grid, background: T.surfaceNormal, borderBottom: `1px solid ${T.surfaceHeavy}`, padding: '0 20px', height: 44, alignItems: 'center', gap: 10 }}>
              {cols.map(c => (
                <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: c.align === 'right' ? 'flex-end' : 'flex-start', overflow: 'hidden' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.fg3, letterSpacing: '0.04px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.key}</span>
                  {c.sortable && <Icon name="ArrowDown" size={12} color={T.fg4} />}
                </div>
              ))}
            </div>
            {pagedRows.length === 0 && (
              <div style={{ padding: '48px 0', textAlign: 'center', color: T.fg4, fontSize: 13 }}>
                조회 결과가 없습니다.
              </div>
            )}
            {pagedRows.map((r, i) => (
              <div key={r.id}
                onClick={() => onRowClick?.(r)}
                style={{ display: 'grid', gridTemplateColumns: grid, alignItems: 'center', padding: '0 20px', height: 48, borderBottom: i < pagedRows.length - 1 ? `1px solid ${T.surfaceNormal}` : 'none', cursor: onRowClick ? 'pointer' : 'default', gap: 10, transition: 'background 0.12s' }}
                onMouseEnter={e => e.currentTarget.style.background = T.surfaceNormal}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                {cols.map(c => <span key={c.key}>{c.render(r)}</span>)}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: showToolbar ? 'center' : 'space-between', padding: '12px 20px', borderTop: `1px solid ${T.surfaceNormal}`, gap: 4 }}>
          {!showToolbar && <span style={{ fontSize: 12, color: T.fg3 }}>총 <b style={{ color: T.fg2 }}>{rows.length}</b>건</span>}
          {showToolbar ? (
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <IconBtn name="ArrowLeft" ariaLabel="이전" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} />
              {pgNums().map(n => (
                <button key={n} onClick={() => setCurrentPage(n)} style={{
                  all: 'unset', cursor: 'pointer', width: 32, height: 32, borderRadius: 6,
                  fontSize: 13, textAlign: 'center', lineHeight: '32px',
                  background: n === currentPage ? T.primaryHeavy : 'transparent',
                  color: n === currentPage ? '#fff' : T.fg3,
                  fontWeight: n === currentPage ? 700 : 400,
                  border: n === currentPage ? 'none' : `1px solid ${T.borderDefault}`,
                }}>{n}</button>
              ))}
              <IconBtn name="ArrowRight" ariaLabel="다음" onClick={() => setCurrentPage(p => Math.min(Math.ceil(rows.length / pageSize), p + 1))} />
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <IconBtn name="ArrowLeft" ariaLabel="이전" />
              <span style={{ fontSize: 13, color: T.fg2, padding: '0 8px' }}>1 / 1</span>
              <IconBtn name="ArrowRight" ariaLabel="다음" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

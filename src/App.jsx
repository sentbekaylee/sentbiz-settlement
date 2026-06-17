import { useState } from 'react';
import { T } from './lib/tokens.js';
import Sidebar from './components/Sidebar.jsx';
import SettlementWrapper from './pages/settlement/SettlementWrapper.jsx';

export default function App() {
  const [page,   setPage]   = useState('settlement-daily');
  const [folded, setFolded] = useState(false);
  const [lang,   setLang]   = useState('ko');

  return (
    <div style={{ display: 'flex', height: '100vh', background: T.surfaceNormal, overflow: 'hidden' }}>
      <Sidebar active={page} onNavigate={setPage} folded={folded} onToggleFold={() => setFolded(f => !f)} lang={lang} onLangChange={setLang} />
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <SettlementWrapper active={page} onNavigate={setPage} lang={lang} />
      </main>
    </div>
  );
}

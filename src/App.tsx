import { useEffect, useState } from 'react';
import { seedDatabaseIfEmpty } from './db';
import { TabBar, TabId } from './components/TabBar';
import { ListasView } from './views/ListasView';
import { ProdutosView } from './views/ProdutosView';
import { LojasView } from './views/LojasView';
import { DefinicoesView } from './views/DefinicoesView';

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>('listas');
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        await seedDatabaseIfEmpty();
      } catch (err) {
        console.error('Erro a inicializar base de dados:', err);
      } finally {
        setIsInitializing(false);
      }
    }
    init();
  }, []);

  if (isInitializing) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--ios-bg-grouped)',
        color: 'var(--ios-label-secondary)',
        fontFamily: 'var(--font-ios)',
        fontSize: '15px'
      }}>
        A carregar ecossistema...
      </div>
    );
  }

  return (
    <div className="app-container">
      <main style={{ flex: 1 }}>
        {activeTab === 'listas' && <ListasView />}
        {activeTab === 'produtos' && <ProdutosView />}
        {activeTab === 'lojas' && <LojasView />}
        {activeTab === 'definicoes' && <DefinicoesView />}
      </main>

      {/* Tab Bar Inferior Translúcida iOS */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;

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
  const [currency, setCurrency] = useState<string>(() => {
    return localStorage.getItem('preferred_currency') || 'EUR';
  });

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

  // Sincronizar moeda com o localStorage quando for atualizada
  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    localStorage.setItem('preferred_currency', newCurrency);
  };

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
        {activeTab === 'listas' && <ListasView currency={currency} />}
        {activeTab === 'produtos' && <ProdutosView currency={currency} />}
        {activeTab === 'lojas' && <LojasView />}
        {activeTab === 'definicoes' && (
          <DefinicoesView currency={currency} onCurrencyChange={handleCurrencyChange} />
        )}
      </main>

      {/* Tab Bar Inferior Translúcida iOS */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;

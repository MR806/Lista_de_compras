import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Header } from '../components/Header';
import { Database, RefreshCw, Smartphone, Store, Package, ShoppingBag, History, Tags } from 'lucide-react';
import { INITIAL_LOJAS, INITIAL_CATEGORIAS, INITIAL_PRODUTOS, INITIAL_HISTORICO_PRECOS, INITIAL_LISTAS, INITIAL_ITENS_LISTA, INITIAL_SUGESTOES } from '../db/seed';

interface DefinicoesViewProps {
  currency: string;
  onCurrencyChange: (currency: string) => void;
}

export function DefinicoesView({ currency, onCurrencyChange }: DefinicoesViewProps) {
  const countLojas = useLiveQuery(() => db.lojas.count(), []) ?? 0;
  const countCategorias = useLiveQuery(() => db.categorias.count(), []) ?? 0;
  const countProdutos = useLiveQuery(() => db.produtos.count(), []) ?? 0;
  const countPrecos = useLiveQuery(() => db.historico_precos.count(), []) ?? 0;
  const countListas = useLiveQuery(() => db.listas_compras.count(), []) ?? 0;
  const countItens = useLiveQuery(() => db.itens_lista.count(), []) ?? 0;

  const handleResetDatabase = async () => {
    if (confirm('Tem a certeza que deseja repor os dados de exemplo da base de dados?')) {
      await db.transaction('rw', [db.lojas, db.categorias, db.produtos, db.historico_precos, db.listas_compras, db.itens_lista, db.sugestoes_historico], async () => {
        await db.lojas.clear();
        await db.categorias.clear();
        await db.produtos.clear();
        await db.historico_precos.clear();
        await db.listas_compras.clear();
        await db.itens_lista.clear();
        await db.sugestoes_historico.clear();

        await db.lojas.bulkAdd(INITIAL_LOJAS);
        await db.categorias.bulkAdd(INITIAL_CATEGORIAS);
        await db.produtos.bulkAdd(INITIAL_PRODUTOS);
        await db.historico_precos.bulkAdd(INITIAL_HISTORICO_PRECOS);
        await db.listas_compras.bulkAdd(INITIAL_LISTAS);
        await db.itens_lista.bulkAdd(INITIAL_ITENS_LISTA);
        await db.sugestoes_historico.bulkAdd(INITIAL_SUGESTOES);
      });
      alert('Base de dados restaurada com sucesso!');
    }
  };

  return (
    <>
      <Header title="Definições" subtitle="Configurações e dados do sistema" />

      <div className="view-container">
        {/* Cartão de Estado do Sistema */}
        <div className="ios-card" style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Database size={24} />
          </div>
          <div>
            <div style={{ fontWeight: '600', fontSize: '16px' }}>IndexedDB Relacional (Dexie)</div>
            <div style={{ fontSize: '13px', color: 'var(--ios-label-secondary)', marginTop: '2px' }}>
              Base de dados local persistente e rápida
            </div>
          </div>
        </div>

        {/* Escolha de Moeda */}
        <h2 style={{ fontSize: '13px', fontWeight: '500', color: 'var(--ios-label-secondary)', textTransform: 'uppercase', marginBottom: '8px', marginLeft: '4px' }}>
          Moeda de Preferência
        </h2>
        <div className="ios-card" style={{ padding: '12px 16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '15px', fontWeight: '500' }}>Moeda Ativa</span>
            <div style={{ display: 'flex', gap: '6px', background: 'var(--ios-gray-ultra-light)', padding: '4px', borderRadius: '8px' }}>
              {['EUR', 'MZN', 'USD'].map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => onCurrencyChange(c)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    background: currency === c ? 'var(--ios-card-bg)' : 'transparent',
                    color: currency === c ? 'var(--ios-blue)' : 'var(--ios-label-secondary)',
                    boxShadow: currency === c ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Resumo de Registos */}
        <h2 style={{ fontSize: '13px', fontWeight: '500', color: 'var(--ios-label-secondary)', textTransform: 'uppercase', marginBottom: '8px', marginLeft: '4px' }}>
          Estatísticas da Base de Dados
        </h2>

        <div className="ios-card" style={{ padding: '0', overflow: 'hidden', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '0.5px solid var(--ios-card-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Store size={18} color="var(--ios-blue)" />
              <span style={{ fontSize: '15px' }}>Lojas Registadas</span>
            </div>
            <span style={{ fontWeight: '600', color: 'var(--ios-label-secondary)' }}>{countLojas}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '0.5px solid var(--ios-card-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Tags size={18} color="var(--ios-orange)" />
              <span style={{ fontSize: '15px' }}>Categorias</span>
            </div>
            <span style={{ fontWeight: '600', color: 'var(--ios-label-secondary)' }}>{countCategorias}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '0.5px solid var(--ios-card-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Package size={18} color="var(--ios-purple)" />
              <span style={{ fontSize: '15px' }}>Produtos no Catálogo</span>
            </div>
            <span style={{ fontWeight: '600', color: 'var(--ios-label-secondary)' }}>{countProdutos}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '0.5px solid var(--ios-card-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <History size={18} color="var(--ios-green)" />
              <span style={{ fontSize: '15px' }}>Registos de Preço</span>
            </div>
            <span style={{ fontWeight: '600', color: 'var(--ios-label-secondary)' }}>{countPrecos}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShoppingBag size={18} color="var(--ios-red)" />
              <span style={{ fontSize: '15px' }}>Listas de Compras ({countItens} itens)</span>
            </div>
            <span style={{ fontWeight: '600', color: 'var(--ios-label-secondary)' }}>{countListas}</span>
          </div>
        </div>

        {/* Ações de Gestão */}
        <h2 style={{ fontSize: '13px', fontWeight: '500', color: 'var(--ios-label-secondary)', textTransform: 'uppercase', marginBottom: '8px', marginLeft: '4px' }}>
          Manutenção
        </h2>

        <div className="ios-card" style={{ padding: '0', overflow: 'hidden', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={handleResetDatabase}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--ios-blue)',
              fontSize: '15px',
              fontWeight: '500',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <RefreshCw size={18} />
              <span>Repor Dados de Exemplo (Seed)</span>
            </div>
          </button>
        </div>

        {/* Informações de Aplicação */}
        <div style={{ textAlign: 'center', color: 'var(--ios-label-secondary)', fontSize: '13px', marginTop: '30px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Smartphone size={14} />
            <span style={{ fontWeight: '600' }}>Apple iOS Ecosystem Experience</span>
          </div>
          <div>Lista de Compras & Controlo de Stock v1.0.0</div>
          <div style={{ marginTop: '2px', fontSize: '12px', opacity: 0.8 }}>Vite • React 19 • TypeScript • Dexie DB</div>
        </div>
      </div>
    </>
  );
}

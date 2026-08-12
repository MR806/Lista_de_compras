import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Header } from '../components/Header';
import { BottomSheet } from '../components/BottomSheet';
import { Store, MapPin, Search, Trash2, Tag } from 'lucide-react';
import { Loja } from '../types/database';

export function LojasView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  
  // Estado do formulário de nova loja
  const [nome, setNome] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [cor, setCor] = useState('#007AFF');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Consulta reativa à base de dados Dexie
  const lojas = useLiveQuery(() => db.lojas.toArray(), []) || [];
  const historicoPrecos = useLiveQuery(() => db.historico_precos.toArray(), []) || [];

  // Filtragem por termo de pesquisa
  const lojasFiltradas = lojas.filter((loja) =>
    loja.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (loja.localizacao && loja.localizacao.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddLoja = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    setIsSubmitting(true);
    try {
      const novaLoja: Loja = {
        id: `loj-${Date.now()}`,
        nome: nome.trim(),
        localizacao: localizacao.trim() || undefined,
        cor_identificadora: cor,
        criado_em: new Date().toISOString(),
      };

      await db.lojas.add(novaLoja);

      // Limpar formulário e fechar sheet
      setNome('');
      setLocalizacao('');
      setCor('#007AFF');
      setIsBottomSheetOpen(false);
    } catch (err) {
      console.error('Erro a adicionar loja:', err);
      alert('Não foi possível guardar a loja. Verifique se o nome já existe.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLoja = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem a certeza que deseja eliminar esta loja?')) {
      await db.lojas.delete(id);
    }
  };

  // Cores predefinidas no estilo iOS
  const coresIOS = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE', '#5AC8FA', '#E30613', '#006837'];

  return (
    <>
      <Header
        title="Lojas"
        subtitle={`${lojas.length} supermercados registados`}
        actionLabel="Nova Loja"
        onAction={() => setIsBottomSheetOpen(true)}
      />

      <div className="view-container">
        {/* Barra de Pesquisa */}
        <div className="ios-search-bar">
          <Search size={18} color="var(--ios-label-secondary)" />
          <input
            type="text"
            className="ios-search-input"
            placeholder="Pesquisar loja ou localização..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Lista de Lojas */}
        {lojasFiltradas.length === 0 ? (
          <div className="ios-card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--ios-label-secondary)' }}>
            <Store size={40} style={{ opacity: 0.4, marginBottom: '12px' }} />
            <p style={{ fontWeight: '500' }}>Nenhuma loja encontrada</p>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>Clica em "Nova Loja" para adicionar o teu primeiro supermercado.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {lojasFiltradas.map((loja) => {
              const countPrecos = historicoPrecos.filter((h) => h.loja_id === loja.id).length;

              return (
                <div key={loja.id} className="ios-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
                  {/* Ícone de cor da loja */}
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '14px',
                    background: `${loja.cor_identificadora || '#007AFF'}15`,
                    color: loja.cor_identificadora || '#007AFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Store size={22} />
                  </div>

                  {/* Informações da Loja */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '16px' }}>{loja.nome}</div>
                    {loja.localizacao ? (
                      <div style={{ fontSize: '13px', color: 'var(--ios-label-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <MapPin size={12} />
                        <span>{loja.localizacao}</span>
                      </div>
                    ) : (
                      <div style={{ fontSize: '13px', color: 'var(--ios-label-secondary)', marginTop: '2px' }}>
                        Supermercado
                      </div>
                    )}
                  </div>

                  {/* Badge de histórico de preços e botão de eliminar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="ios-badge" style={{ background: 'var(--ios-gray-ultra-light)', color: 'var(--ios-label-secondary)' }}>
                      <Tag size={12} />
                      <span>{countPrecos} preços</span>
                    </div>

                    <button
                      onClick={(e) => handleDeleteLoja(loja.id, e)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--ios-red)',
                        padding: '6px',
                        cursor: 'pointer',
                        opacity: 0.7,
                      }}
                      title="Eliminar Loja"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Sheet de Criação de Loja (iOS Modal Slidin Up) */}
      <BottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        title="Adicionar Nova Loja"
      >
        <form onSubmit={handleAddLoja} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="ios-form-group">
            <label className="ios-form-label">Nome da Loja *</label>
            <input
              type="text"
              className="ios-input"
              placeholder="Ex: Continente, Pingo Doce, Lidl..."
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="ios-form-group">
            <label className="ios-form-label">Localização / Morada (Opcional)</label>
            <input
              type="text"
              className="ios-input"
              placeholder="Ex: Central, Chiado, Zona Industrial..."
              value={localizacao}
              onChange={(e) => setLocalizacao(e.target.value)}
            />
          </div>

          <div className="ios-form-group">
            <label className="ios-form-label">Cor Identificadora (iOS Style)</label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px', flexWrap: 'wrap' }}>
              {coresIOS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCor(c)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: c,
                    border: cor === c ? '3px solid #FFFFFF' : 'none',
                    boxShadow: cor === c ? `0 0 0 2px ${c}` : 'none',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease',
                  }}
                />
              ))}
            </div>
          </div>

          <button type="submit" className="ios-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'A guardar...' : 'Guardar Loja'}
          </button>
        </form>
      </BottomSheet>
    </>
  );
}

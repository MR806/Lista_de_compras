import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Header } from '../components/Header';
import { BottomSheet } from '../components/BottomSheet';
import { Package, Search, Plus, Minus, AlertTriangle, Trash2, Tag } from 'lucide-react';
import { Produto } from '../types/database';

export function ProdutosView() {
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<string | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  // Formulário de novo produto
  const [nome, setNome] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [unidadeMedida, setUnidadeMedida] = useState<'un' | 'kg' | 'g' | 'L' | 'ml' | 'pack'>('un');
  const [stockAtual, setStockAtual] = useState<number>(1);
  const [stockMinimo, setStockMinimo] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Consultas reativas Dexie
  const categorias = useLiveQuery(() => db.categorias.toArray(), []) || [];
  const produtos = useLiveQuery(() => db.produtos.toArray(), []) || [];
  const historicoPrecos = useLiveQuery(() => db.historico_precos.toArray(), []) || [];

  // Filtragem por categoria e termo de busca
  const produtosFiltrados = produtos.filter((prod) => {
    const matchesCategory = selectedCategoriaId === 'all' || prod.categoria_id === selectedCategoriaId;
    const matchesSearch = prod.nome.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !categoriaId) {
      alert('Por favor preencha o nome do produto e selecione uma categoria.');
      return;
    }

    setIsSubmitting(true);
    try {
      const novoProduto: Produto = {
        id: `prod-${Date.now()}`,
        nome: nome.trim(),
        categoria_id: categoriaId,
        unidade_medida: unidadeMedida,
        stock_atual: Number(stockAtual) || 0,
        stock_minimo: Number(stockMinimo) || 1,
        criado_em: new Date().toISOString(),
      };

      await db.produtos.add(novoProduto);

      // Limpar campos
      setNome('');
      setCategoriaId('');
      setUnidadeMedida('un');
      setStockAtual(1);
      setStockMinimo(1);
      setIsBottomSheetOpen(false);
    } catch (err) {
      console.error('Erro ao guardar produto:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStock = async (produtoId: string, delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const prod = await db.produtos.get(produtoId);
    if (!prod) return;

    const novoStock = Math.max(0, prod.stock_atual + delta);
    await db.produtos.update(produtoId, { stock_atual: novoStock });
  };

  const handleDeleteProduto = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem a certeza que deseja eliminar este produto do catálogo?')) {
      await db.produtos.delete(id);
    }
  };

  // Mapeamento id -> Categoria para fácil acesso visual
  const categoriaMap = new Map(categorias.map((c) => [c.id, c]));

  return (
    <>
      <Header
        title="Catálogo & Stock"
        subtitle={`${produtos.length} produtos no inventário da casa`}
        actionLabel="Novo Produto"
        onAction={() => {
          if (categorias.length > 0 && !categoriaId) {
            setCategoriaId(categorias[0].id);
          }
          setIsBottomSheetOpen(true);
        }}
      />

      <div className="view-container">
        {/* Barra de Pesquisa */}
        <div className="ios-search-bar">
          <Search size={18} color="var(--ios-label-secondary)" />
          <input
            type="text"
            className="ios-search-input"
            placeholder="Pesquisar por nome de produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Pílulas de Filtro por Categoria (iOS Pill Scroll) */}
        <div className="ios-pill-container">
          <button
            type="button"
            className={`ios-pill ${selectedCategoriaId === 'all' ? 'ios-pill-active' : ''}`}
            onClick={() => setSelectedCategoriaId('all')}
          >
            Todas ({produtos.length})
          </button>
          {categorias.map((cat) => {
            const countCat = produtos.filter((p) => p.categoria_id === cat.id).length;
            return (
              <button
                type="button"
                key={cat.id}
                className={`ios-pill ${selectedCategoriaId === cat.id ? 'ios-pill-active' : ''}`}
                onClick={() => setSelectedCategoriaId(cat.id)}
              >
                {cat.nome} ({countCat})
              </button>
            );
          })}
        </div>

        {/* Lista de Produtos */}
        {produtosFiltrados.length === 0 ? (
          <div className="ios-card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--ios-label-secondary)' }}>
            <Package size={40} style={{ opacity: 0.4, marginBottom: '12px' }} />
            <p style={{ fontWeight: '500' }}>Nenhum produto encontrado</p>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>Clica em "Novo Produto" para adicionar um item ao catálogo.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {produtosFiltrados.map((prod) => {
              const cat = categoriaMap.get(prod.categoria_id);
              const isStockBaixo = prod.stock_atual <= prod.stock_minimo;
              const precosProd = historicoPrecos.filter((h) => h.produto_id === prod.id);
              const menorPreco = precosProd.length > 0 ? Math.min(...precosProd.map((h) => h.preco)) : null;

              return (
                <div key={prod.id} className="ios-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  {/* Ícone & Categoria */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className="ios-badge" style={{ background: cat?.cor_badge ? `${cat.cor_badge}18` : 'var(--ios-gray-ultra-light)', color: cat?.cor_badge || 'var(--ios-gray)' }}>
                        <Tag size={10} />
                        {cat?.nome || 'Geral'}
                      </span>
                      {isStockBaixo && (
                        <span className="ios-badge" style={{ background: 'rgba(255, 59, 48, 0.12)', color: 'var(--ios-red)' }}>
                          <AlertTriangle size={11} />
                          Stock Baixo
                        </span>
                      )}
                    </div>

                    <div style={{ fontWeight: '600', fontSize: '16px', color: 'var(--ios-label-primary)' }}>
                      {prod.nome}
                    </div>

                    <div style={{ fontSize: '13px', color: 'var(--ios-label-secondary)', marginTop: '2px' }}>
                      Mínimo: {prod.stock_minimo} {prod.unidade_medida || 'un'}
                      {menorPreco !== null && ` • Melhor Preço: ${menorPreco.toFixed(2)}€`}
                    </div>
                  </div>

                  {/* Controlo de Stock Rápido + Botão Eliminar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="ios-stock-counter">
                      <button
                        type="button"
                        className="ios-stock-btn"
                        onClick={(e) => handleUpdateStock(prod.id, -1, e)}
                        title="Diminuir Stock"
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ fontWeight: '700', fontSize: '14px', minWidth: '24px', textAlign: 'center' }}>
                        {prod.stock_atual}
                      </span>
                      <button
                        type="button"
                        className="ios-stock-btn"
                        onClick={(e) => handleUpdateStock(prod.id, 1, e)}
                        title="Aumentar Stock"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteProduto(prod.id, e)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--ios-red)',
                        padding: '6px',
                        cursor: 'pointer',
                        opacity: 0.7,
                      }}
                      title="Eliminar Produto"
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

      {/* Bottom Sheet de Criação de Produto */}
      <BottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        title="Adicionar Produto ao Catálogo"
      >
        <form onSubmit={handleAddProduto} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="ios-form-group">
            <label className="ios-form-label">Nome do Produto *</label>
            <input
              type="text"
              className="ios-input"
              placeholder="Ex: Leite Meio Gordo, Ovos Dúzia, Azeite..."
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="ios-form-group">
            <label className="ios-form-label">Categoria *</label>
            <select
              className="ios-select"
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              required
            >
              <option value="" disabled>Selecione uma categoria...</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nome}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="ios-form-group">
              <label className="ios-form-label">Unidade Medida</label>
              <select
                className="ios-select"
                value={unidadeMedida}
                onChange={(e) => setUnidadeMedida(e.target.value as any)}
              >
                <option value="un">Unidade (un)</option>
                <option value="kg">Quilograma (kg)</option>
                <option value="g">Gramas (g)</option>
                <option value="L">Litros (L)</option>
                <option value="ml">Mililitros (ml)</option>
                <option value="pack">Embalagem/Pack</option>
              </select>
            </div>

            <div className="ios-form-group">
              <label className="ios-form-label">Stock Atual</label>
              <input
                type="number"
                step="0.5"
                min="0"
                className="ios-input"
                value={stockAtual}
                onChange={(e) => setStockAtual(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="ios-form-group">
            <label className="ios-form-label">Stock Mínimo (Alerta de Reabastecimento)</label>
            <input
              type="number"
              step="0.5"
              min="0"
              className="ios-input"
              value={stockMinimo}
              onChange={(e) => setStockMinimo(Number(e.target.value))}
            />
          </div>

          <button type="submit" className="ios-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'A guardar...' : 'Guardar Produto'}
          </button>
        </form>
      </BottomSheet>
    </>
  );
}

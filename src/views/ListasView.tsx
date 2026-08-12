import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Header } from '../components/Header';
import { BottomSheet } from '../components/BottomSheet';
import { ActionSheet } from '../components/ActionSheet';
import { SwipeableItem } from '../components/SwipeableItem';
import {
  ShoppingBag,
  CheckCircle2,
  Clock,
  Trash2,
  ChevronLeft,
  Copy,
  ChevronRight,
  PackageOpen,
  Info,
  Store as StoreIcon,
  Circle
} from 'lucide-react';
import { ListaCompras, ItemLista, Produto, Categoria, Loja, HistoricoPreco } from '../types/database';

export function ListasView() {
  const [activeListId, setActiveListId] = useState<string | null>(null);
  
  // Modais e Menus
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isCloneSheetOpen, setIsCloneSheetOpen] = useState(false);

  // Modais da Etapa 4
  const [isPurchaseSheetOpen, setIsPurchaseSheetOpen] = useState(false);
  const [purchaseItem, setPurchaseItem] = useState<ItemLista | null>(null);
  const [purchasePrice, setPurchasePrice] = useState<string>('');
  const [purchaseLojaId, setPurchaseLojaId] = useState<string>('');

  const [isHistorySheetOpen, setIsHistorySheetOpen] = useState(false);
  const [historyProduto, setHistoryProduto] = useState<Produto | null>(null);

  // Formulário de nova lista
  const [nomeLista, setNomeLista] = useState('');
  const [orcamentoEstimado, setOrcamentoEstimado] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Consultas reativas Dexie
  const listas = useLiveQuery(() => db.listas_compras.toArray(), []) || [];
  const itens = useLiveQuery(() => db.itens_lista.toArray(), []) || [];
  const produtos = useLiveQuery(() => db.produtos.toArray(), []) || [];
  const categorias = useLiveQuery(() => db.categorias.toArray(), []) || [];
  const lojas = useLiveQuery(() => db.lojas.toArray(), []) || [];
  const historicoPrecos = useLiveQuery(() => db.historico_precos.toArray(), []) || [];

  const produtoMap = new Map<string, Produto>(produtos.map((p) => [p.id, p]));
  const categoriaMap = new Map<string, Categoria>(categorias.map((c) => [c.id, c]));
  const lojaMap = new Map<string, Loja>(lojas.map((l) => [l.id, l]));

  // Obter última loja usada (persistência local)
  useEffect(() => {
    const savedLojaId = localStorage.getItem('last_loja_id');
    if (savedLojaId) {
      setPurchaseLojaId(savedLojaId);
    } else if (lojas.length > 0) {
      setPurchaseLojaId(lojas[0].id);
    }
  }, [lojas]);

  // Separar listas abertas e fechadas
  const listasAbertas = listas.filter((l) => l.estado === 'aberta');
  const listasFechadas = listas.filter((l) => l.estado === 'fechada');

  // Lógica de Criar Lista do Zero
  const handleAddLista = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeLista.trim()) return;

    setIsSubmitting(true);
    try {
      const novaLista: ListaCompras = {
        id: `lst-${Date.now()}`,
        nome_lista: nomeLista.trim(),
        data_criacao: new Date().toISOString(),
        estado: 'aberta',
        orcamento_estimado: orcamentoEstimado ? Number(orcamentoEstimado) : undefined,
        atualizado_em: new Date().toISOString(),
      };

      await db.listas_compras.add(novaLista);

      setNomeLista('');
      setOrcamentoEstimado('');
      setIsCreateSheetOpen(false);
      setActiveListId(novaLista.id);
    } catch (err) {
      console.error('Erro ao adicionar lista:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lógica de Duplicação/Clonagem de Lista
  const handleCloneLista = async (targetListaId: string) => {
    const originalLista = listas.find((l) => l.id === targetListaId);
    if (!originalLista) return;

    try {
      const novaListaId = `lst-${Date.now()}`;
      
      const novaLista: ListaCompras = {
        id: novaListaId,
        nome_lista: `${originalLista.nome_lista} (Duplicada)`,
        data_criacao: new Date().toISOString(),
        estado: 'aberta',
        orcamento_estimado: originalLista.orcamento_estimado,
        atualizado_em: new Date().toISOString(),
      };

      await db.listas_compras.add(novaLista);

      const itensOriginais = itens.filter((item) => item.lista_id === targetListaId);

      const novosItens: ItemLista[] = itensOriginais.map((item, idx) => ({
        id: `itm-${Date.now()}-${idx}`,
        lista_id: novaListaId,
        produto_id: item.produto_id,
        loja_preferencial_id: item.loja_preferencial_id,
        quantidade: item.quantidade,
        estado: 'pendente',
        preco_unitario_pago: undefined,
        notas: item.notas,
        criado_em: new Date().toISOString(),
      }));

      if (novosItens.length > 0) {
        await db.itens_lista.bulkAdd(novosItens);
      }

      setIsCloneSheetOpen(false);
      setActiveListId(novaListaId);
    } catch (err) {
      console.error('Erro ao clonar lista compras:', err);
    }
  };

  const handleToggleEstado = async (lista: ListaCompras, e: React.MouseEvent) => {
    e.stopPropagation();
    const novoEstado = lista.estado === 'aberta' ? 'fechada' : 'aberta';
    await db.listas_compras.update(lista.id, {
      estado: novoEstado,
      atualizado_em: new Date().toISOString(),
    });
  };

  const handleDeleteLista = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem a certeza que deseja eliminar esta lista de compras?')) {
      await db.listas_compras.delete(id);
      const itensAssociados = itens.filter((i) => i.lista_id === id);
      await Promise.all(itensAssociados.map((i) => db.itens_lista.delete(i.id)));
      if (activeListId === id) {
        setActiveListId(null);
      }
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    await db.itens_lista.delete(itemId);
  };

  // Clique no círculo de check-off
  const handleCircleClick = (item: ItemLista, e: React.MouseEvent) => {
    e.stopPropagation(); // Não acionar visualizador de histórico

    if (item.estado === 'comprado') {
      // Se já estava comprado, reverte para pendente sem perguntar nada
      db.itens_lista.update(item.id, {
        estado: 'pendente',
        preco_unitario_pago: undefined
      });
    } else {
      // Se for marcar como comprado, abre o Bottom Sheet de registo de preço
      setPurchaseItem(item);
      
      // Tentar preencher com o melhor preço conhecido como sugestão
      const precosProd = historicoPrecos.filter((h) => h.produto_id === item.produto_id);
      if (precosProd.length > 0) {
        const melhorPreco = Math.min(...precosProd.map((h) => h.preco));
        setPurchasePrice(melhorPreco.toString());
      } else {
        setPurchasePrice('');
      }

      // Predefinir com a última loja usada ou a loja preferencial do item
      if (item.loja_preferencial_id) {
        setPurchaseLojaId(item.loja_preferencial_id);
      } else {
        const lastLoja = localStorage.getItem('last_loja_id');
        if (lastLoja) {
          setPurchaseLojaId(lastLoja);
        } else if (lojas.length > 0) {
          setPurchaseLojaId(lojas[0].id);
        }
      }
      setIsPurchaseSheetOpen(true);
    }
  };

  // Guardar registo de compra e preço
  const handleSavePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseItem || !purchasePrice.trim() || !purchaseLojaId) return;

    const precoNum = Number(purchasePrice);
    if (isNaN(precoNum) || precoNum < 0) {
      alert('Por favor introduza um preço válido.');
      return;
    }

    try {
      // 1. Atualizar o item da lista
      await db.itens_lista.update(purchaseItem.id, {
        estado: 'comprado',
        preco_unitario_pago: precoNum,
        loja_preferencial_id: purchaseLojaId
      });

      // 2. Registar no histórico de preços
      const novoHistorico: HistoricoPreco = {
        id: `hist-${Date.now()}`,
        produto_id: purchaseItem.produto_id,
        loja_id: purchaseLojaId,
        preco: precoNum,
        data: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        em_promocao: false,
        criado_em: new Date().toISOString()
      };

      await db.historico_precos.add(novoHistorico);

      // Guardar a última loja usada
      localStorage.setItem('last_loja_id', purchaseLojaId);

      // Atualizar stock em casa (incrementar stock_atual com base na quantidade comprada)
      const prod = produtoMap.get(purchaseItem.produto_id);
      if (prod) {
        await db.produtos.update(prod.id, {
          stock_atual: prod.stock_atual + purchaseItem.quantidade
        });
      }

      // Limpar estados
      setIsPurchaseSheetOpen(false);
      setPurchaseItem(null);
      setPurchasePrice('');
    } catch (err) {
      console.error('Erro ao registar compra:', err);
    }
  };

  // Detalhe de Histórico do Produto ao clicar no Nome
  const handleProductClick = (produtoId: string) => {
    const prod = produtoMap.get(produtoId);
    if (prod) {
      setHistoryProduto(prod);
      setIsHistorySheetOpen(true);
    }
  };

  // Renderização da vista de detalhe de uma lista
  if (activeListId) {
    const lista = listas.find((l) => l.id === activeListId);
    const itensDaLista = itens.filter((i) => i.lista_id === activeListId);

    // Requisito 1: Itens marcados como comprado descem para o fim da lista
    const sortedItens = [...itensDaLista].sort((a, b) => {
      if (a.estado === b.estado) {
        return new Date(a.criado_em || '').getTime() - new Date(b.criado_em || '').getTime();
      }
      return a.estado === 'pendente' ? -1 : 1; // pendentes no topo, comprados no fim
    });

    const totalItens = itensDaLista.length;
    const concluidos = itensDaLista.filter((i) => i.estado === 'comprado').length;
    const percentagem = totalItens > 0 ? Math.round((concluidos / totalItens) * 100) : 0;

    return (
      <>
        <header className="ios-header">
          <button
            type="button"
            onClick={() => setActiveListId(null)}
            className="ios-action-btn"
            style={{ padding: '8px 12px', background: 'transparent' }}
          >
            <ChevronLeft size={22} style={{ marginLeft: '-4px' }} />
            <span>Listas</span>
          </button>
          <h2 className="ios-sheet-title" style={{ flex: 1, textAlign: 'center', marginRight: '40px' }}>
            {lista?.nome_lista || 'Detalhes'}
          </h2>
        </header>

        <div className="view-container" style={{ animation: 'iosFadeIn 0.2s ease-out' }}>
          {/* Resumo de Progresso e Orçamento */}
          <div className="ios-card" style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--ios-label-secondary)' }}>
              <span>Orçamento Estimado: {lista?.orcamento_estimado ? `${lista.orcamento_estimado.toFixed(2)}€` : 'N/A'}</span>
              <span style={{ fontWeight: '600', color: 'var(--ios-blue)' }}>{concluidos} / {totalItens} comprados</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'var(--ios-gray-light)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${percentagem}%`, height: '100%', background: 'var(--ios-blue)', borderRadius: '3px', transition: 'width 0.3s ease' }} />
            </div>
          </div>

          <h3 style={{ fontSize: '13px', fontWeight: '500', color: 'var(--ios-label-secondary)', textTransform: 'uppercase', marginBottom: '8px', marginLeft: '4px' }}>
            Itens de Compra
          </h3>

          {sortedItens.length === 0 ? (
            <div className="ios-card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--ios-label-secondary)' }}>
              <PackageOpen size={36} style={{ opacity: 0.4, marginBottom: '8px' }} />
              <p style={{ fontWeight: '500' }}>Nenhum item adicionado</p>
              <p style={{ fontSize: '13px', marginTop: '4px' }}>Esta lista está vazia. Adicione produtos no catálogo.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {sortedItens.map((item) => {
                const prod = produtoMap.get(item.produto_id);
                const cat = prod ? categoriaMap.get(prod.categoria_id) : undefined;
                const isComprado = item.estado === 'comprado';

                return (
                  <SwipeableItem
                    key={item.id}
                    onDelete={() => handleDeleteItem(item.id)}
                    confirmMessage="Desejas remover este item da lista?"
                  >
                    <div
                      className="ios-card"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        background: 'var(--ios-card-bg)',
                        opacity: isComprado ? 0.6 : 1,
                        transition: 'opacity 0.25s, transform 0.25s',
                        borderLeft: isComprado ? '4px solid var(--ios-green)' : '1px solid var(--ios-card-border)',
                      }}
                    >
                      {/* Check-off Círculo à Esquerda */}
                      <button
                        type="button"
                        onClick={(e) => handleCircleClick(item, e)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isComprado ? 'var(--ios-green)' : 'var(--ios-gray-light)',
                          padding: '4px',
                          marginLeft: '-4px'
                        }}
                      >
                        {isComprado ? (
                          <CheckCircle2 size={24} color="var(--ios-green)" style={{ fill: 'rgba(52, 199, 89, 0.1)' }} />
                        ) : (
                          <Circle size={24} color="var(--ios-gray)" />
                        )}
                      </button>

                      {/* Nome do Produto (Dispara Histórico) */}
                      <div
                        style={{ flex: 1, cursor: 'pointer' }}
                        onClick={() => handleProductClick(item.produto_id)}
                      >
                        <div style={{
                          fontWeight: '600',
                          fontSize: '16px',
                          textDecoration: isComprado ? 'line-through' : 'none',
                          color: 'var(--ios-label-primary)'
                        }}>
                          {prod?.nome || 'Produto Desconhecido'}
                        </div>
                        
                        <div style={{ fontSize: '12px', color: 'var(--ios-label-secondary)', display: 'flex', gap: '6px', marginTop: '2px', alignItems: 'center' }}>
                          <span>Qtd: {item.quantidade} {prod?.unidade_medida || 'un'}</span>
                          {cat && (
                            <span style={{ color: cat.cor_badge }}>
                              • {cat.nome}
                            </span>
                          )}
                          {item.preco_unitario_pago && (
                            <span style={{ color: 'var(--ios-green)', fontWeight: '600' }}>
                              • Pago: {item.preco_unitario_pago.toFixed(2)}€
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Info Icon para Histórico rápido */}
                      <button
                        type="button"
                        onClick={() => handleProductClick(item.produto_id)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--ios-blue)', cursor: 'pointer', opacity: 0.8 }}
                      >
                        <Info size={18} />
                      </button>
                    </div>
                  </SwipeableItem>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Sheet rápido: Registo de Preço e Loja da Compra */}
        <BottomSheet
          isOpen={isPurchaseSheetOpen}
          onClose={() => {
            setIsPurchaseSheetOpen(false);
            setPurchaseItem(null);
          }}
          title="Registar Compra"
        >
          <form onSubmit={handleSavePurchase} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '14px', color: 'var(--ios-label-secondary)' }}>
              Introduza o preço pago pelo produto para guardar no histórico de comparativos.
            </p>

            <div className="ios-form-group">
              <label className="ios-form-label">Preço Unitário Atual (€) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="ios-input"
                placeholder="Ex: 1.25"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="ios-form-group">
              <label className="ios-form-label">Supermercado / Loja *</label>
              <select
                className="ios-select"
                value={purchaseLojaId}
                onChange={(e) => setPurchaseLojaId(e.target.value)}
                required
              >
                <option value="" disabled>Selecione onde comprou...</option>
                {lojas.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nome}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="ios-submit-btn">
              Confirmar & Atualizar Stock
            </button>
          </form>
        </BottomSheet>

        {/* Bottom Sheet: Histórico de Preços do Produto */}
        <BottomSheet
          isOpen={isHistorySheetOpen}
          onClose={() => {
            setIsHistorySheetOpen(false);
            setHistoryProduto(null);
          }}
          title={`Histórico: ${historyProduto?.nome || ''}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {historyProduto && (
              <>
                {/* Comparativo rápido */}
                {(() => {
                  const hist = historicoPrecos.filter((h) => h.produto_id === historyProduto.id);
                  if (hist.length === 0) {
                    return (
                      <div className="ios-card" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--ios-gray-ultra-light)' }}>
                        <Info size={16} color="var(--ios-label-secondary)" />
                        <span style={{ fontSize: '13px', color: 'var(--ios-label-secondary)' }}>
                          Nenhum histórico de compras registado para este produto ainda.
                        </span>
                      </div>
                    );
                  }

                  const precos = hist.map((h) => h.preco);
                  const min = Math.min(...precos);
                  const max = Math.max(...precos);
                  const melhorLoja = hist.find((h) => h.preco === min);

                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
                      <div className="ios-card" style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: 'rgba(52, 199, 89, 0.05)', borderColor: 'rgba(52, 199, 89, 0.1)' }}>
                        <span style={{ fontSize: '11px', color: 'var(--ios-green)', fontWeight: '600', textTransform: 'uppercase' }}>Melhor Preço</span>
                        <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--ios-green)' }}>{min.toFixed(2)}€</span>
                        {melhorLoja && (
                          <span style={{ fontSize: '11px', color: 'var(--ios-label-secondary)' }}>
                            em {lojaMap.get(melhorLoja.loja_id)?.nome || 'Loja'}
                          </span>
                        )}
                      </div>

                      <div className="ios-card" style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: 'var(--ios-gray-ultra-light)' }}>
                        <span style={{ fontSize: '11px', color: 'var(--ios-label-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Preço Máximo</span>
                        <span style={{ fontSize: '20px', fontWeight: '700' }}>{max.toFixed(2)}€</span>
                        <span style={{ fontSize: '11px', color: 'var(--ios-label-secondary)' }}>Diferença: {(((max - min) / min) * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Lista Completa de Registos */}
                <h4 style={{ fontSize: '12px', fontWeight: '500', color: 'var(--ios-label-secondary)', textTransform: 'uppercase', marginTop: '6px' }}>
                  Registos Anteriores
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                  {[...historicoPrecos]
                    .filter((h) => h.produto_id === historyProduto.id)
                    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                    .map((hp) => {
                      const loja = lojaMap.get(hp.loja_id);

                      return (
                        <div
                          key={hp.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 12px',
                            background: 'var(--ios-gray-ultra-light)',
                            borderRadius: '12px',
                            border: '0.5px solid var(--ios-card-border)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <StoreIcon size={14} color="var(--ios-blue)" />
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: '600' }}>{loja?.nome || 'Supermercado'}</div>
                              <div style={{ fontSize: '11px', color: 'var(--ios-label-secondary)' }}>
                                {new Date(hp.data).toLocaleDateString('pt-PT')}
                              </div>
                            </div>
                          </div>
                          <span style={{ fontWeight: '700', fontSize: '15px' }}>{hp.preco.toFixed(2)}€</span>
                        </div>
                      );
                    })}
                </div>
              </>
            )}
          </div>
        </BottomSheet>
      </>
    );
  }

  // Vista Principal de Listas (A Home)
  return (
    <>
      <Header
        title="Listas"
        subtitle={`${listasAbertas.length} ativas, ${listasFechadas.length} concluídas`}
        actionLabel="Nova Lista"
        onAction={() => setIsActionSheetOpen(true)}
      />

      <div className="view-container">
        {/* SECÇÃO 1: Listas Abertas / Ativas */}
        <h2 style={{ fontSize: '13px', fontWeight: '500', color: 'var(--ios-label-secondary)', textTransform: 'uppercase', marginBottom: '8px', marginLeft: '4px' }}>
          Listas Ativas
        </h2>

        {listasAbertas.length === 0 ? (
          <div className="ios-card" style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--ios-label-secondary)', marginBottom: '24px' }}>
            <ShoppingBag size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
            <p style={{ fontWeight: '500', fontSize: '14px' }}>Sem listas ativas</p>
            <p style={{ fontSize: '12px', marginTop: '2px' }}>Crie uma nova lista para planear as suas compras.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {listasAbertas.map((lista) => {
              const itensDaLista = itens.filter((i) => i.lista_id === lista.id);
              const totalItens = itensDaLista.length;
              const concluidos = itensDaLista.filter((i) => i.estado === 'comprado').length;
              const percentagem = totalItens > 0 ? Math.round((concluidos / totalItens) * 100) : 0;

              return (
                <div
                  key={lista.id}
                  className="ios-card ios-card-interactive"
                  onClick={() => setActiveListId(lista.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span className="ios-badge" style={{ background: 'rgba(0, 122, 255, 0.1)', color: 'var(--ios-blue)' }}>
                      <Clock size={11} />
                      Ativa
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => handleToggleEstado(lista, e)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--ios-green)', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                      >
                        Concluir
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteLista(lista.id, e)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--ios-red)', padding: '2px', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '17px' }}>{lista.nome_lista}</div>
                      <div style={{ fontSize: '12px', color: 'var(--ios-label-secondary)', marginTop: '2px' }}>
                        Criada a {new Date(lista.data_criacao).toLocaleDateString('pt-PT')}
                      </div>
                    </div>
                    <ChevronRight size={18} color="var(--ios-label-tertiary)" />
                  </div>

                  <div style={{ marginTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--ios-label-secondary)', marginBottom: '3px' }}>
                      <span>Progresso</span>
                      <span>{concluidos}/{totalItens} comprados</span>
                    </div>
                    <div style={{ width: '100%', height: '5px', background: 'var(--ios-gray-light)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentagem}%`, height: '100%', background: 'var(--ios-blue)', borderRadius: '3px' }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* SECÇÃO 2: Histórico de Listas Fechadas */}
        <h2 style={{ fontSize: '13px', fontWeight: '500', color: 'var(--ios-label-secondary)', textTransform: 'uppercase', marginBottom: '8px', marginLeft: '4px' }}>
          Histórico de Listas Concluídas
        </h2>

        {listasFechadas.length === 0 ? (
          <div className="ios-card" style={{ textAlign: 'center', padding: '20px 20px', color: 'var(--ios-label-secondary)' }}>
            <p style={{ fontSize: '13px' }}>Sem histórico de compras arquivado.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {listasFechadas.map((lista) => {
              const itensDaLista = itens.filter((i) => i.lista_id === lista.id);
              const totalItens = itensDaLista.length;

              return (
                <div
                  key={lista.id}
                  className="ios-card ios-card-interactive"
                  onClick={() => setActiveListId(lista.id)}
                  style={{ opacity: 0.75, background: 'var(--ios-gray-ultra-light)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span className="ios-badge" style={{ background: 'rgba(52, 199, 89, 0.1)', color: 'var(--ios-green)' }}>
                      <CheckCircle2 size={11} />
                      Arquivada
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => handleToggleEstado(lista, e)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--ios-blue)', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}
                      >
                        Reabrir
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteLista(lista.id, e)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--ios-red)', padding: '2px', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '15px' }}>{lista.nome_lista}</div>
                      <div style={{ fontSize: '12px', color: 'var(--ios-label-secondary)', marginTop: '2px' }}>
                        Finalizada com {totalItens} itens
                      </div>
                    </div>
                    <ChevronRight size={16} color="var(--ios-label-tertiary)" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Menu Principal (Action Sheet estilo iOS) */}
      <ActionSheet
        isOpen={isActionSheetOpen}
        onClose={() => setIsActionSheetOpen(false)}
        title="O que deseja fazer?"
        options={[
          {
            label: 'Criar do zero',
            onClick: () => setIsCreateSheetOpen(true),
          },
          {
            label: 'Duplicar lista anterior',
            onClick: () => {
              if (listas.length === 0) {
                alert('Não existem listas anteriores para duplicar. Crie uma primeira do zero!');
              } else {
                setIsCloneSheetOpen(true);
              }
            },
          },
        ]}
      />

      {/* Bottom Sheet: Criar do zero */}
      <BottomSheet
        isOpen={isCreateSheetOpen}
        onClose={() => setIsCreateSheetOpen(false)}
        title="Nova Lista de Compras"
      >
        <form onSubmit={handleAddLista} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="ios-form-group">
            <label className="ios-form-label">Nome da Lista *</label>
            <input
              type="text"
              className="ios-input"
              placeholder="Ex: Compras da Semana, Mercadona, etc..."
              value={nomeLista}
              onChange={(e) => setNomeLista(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="ios-form-group">
            <label className="ios-form-label">Orçamento Estimado (€, Opcional)</label>
            <input
              type="number"
              step="1"
              min="0"
              className="ios-input"
              placeholder="Ex: 50..."
              value={orcamentoEstimado}
              onChange={(e) => setOrcamentoEstimado(e.target.value)}
            />
          </div>

          <button type="submit" className="ios-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'A criar...' : 'Criar Lista'}
          </button>
        </form>
      </BottomSheet>

      {/* Bottom Sheet: Duplicar lista anterior (Escolher Lista) */}
      <BottomSheet
        isOpen={isCloneSheetOpen}
        onClose={() => setIsCloneSheetOpen(false)}
        title="Duplicar Lista Anterior"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ fontSize: '14px', color: 'var(--ios-label-secondary)', marginBottom: '8px' }}>
            Selecione uma lista anterior para copiar todos os seus itens para uma nova lista com estado 'pendente' e preços vazios.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px', overflowY: 'auto' }}>
            {listas.map((lst) => {
              const qtdItens = itens.filter((i) => i.lista_id === lst.id).length;

              return (
                <div
                  key={lst.id}
                  onClick={() => handleCloneLista(lst.id)}
                  className="ios-card ios-card-interactive"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderColor: 'var(--ios-gray-light)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '15px' }}>{lst.nome_lista}</div>
                    <div style={{ fontSize: '12px', color: 'var(--ios-label-secondary)', marginTop: '2px' }}>
                      {qtdItens} itens • {lst.estado === 'aberta' ? 'Aberta' : 'Concluída'}
                    </div>
                  </div>
                  <Copy size={16} color="var(--ios-blue)" />
                </div>
              );
            })}
          </div>
        </div>
      </BottomSheet>
    </>
  );
}

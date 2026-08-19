import Dexie, { type Table } from 'dexie';
import {
  Loja,
  Categoria,
  Produto,
  HistoricoPreco,
  ListaCompras,
  ItemLista,
  SugestaoHistorico,
  ComparativoPrecoProduto,
  ItemListaDetalhado,
  ListaComprasDetalhada,
} from '../types/database';
import {
  INITIAL_LOJAS,
  INITIAL_CATEGORIAS,
  INITIAL_PRODUTOS,
  INITIAL_HISTORICO_PRECOS,
  INITIAL_LISTAS,
  INITIAL_ITENS_LISTA,
  INITIAL_SUGESTOES,
} from './seed';

export class AppDatabase extends Dexie {
  lojas!: Table<Loja, string>;
  categorias!: Table<Categoria, string>;
  produtos!: Table<Produto, string>;
  historico_precos!: Table<HistoricoPreco, string>;
  listas_compras!: Table<ListaCompras, string>;
  itens_lista!: Table<ItemLista, string>;
  sugestoes_historico!: Table<SugestaoHistorico, string>;

  constructor() {
    super('ListaComprasDB');

    // Definição dos índices relacionais (id, chaves estrangeiras e campos de pesquisa)
    // Atualizado para a versão 2 com a tabela sugestoes_historico e novos índices em itens_lista
    this.version(2).stores({
      lojas: 'id, &nome',
      categorias: 'id, &nome',
      produtos: 'id, nome, categoria_id, stock_atual, stock_minimo',
      historico_precos: 'id, produto_id, loja_id, [produto_id+loja_id], data',
      listas_compras: 'id, nome_lista, data_criacao, estado',
      itens_lista: 'id, lista_id, nome_produto, categoria, loja, estado',
      sugestoes_historico: 'id, tipo, valor',
    });
  }
}

export const db = new AppDatabase();

/**
 * Inicializa a base de dados com dados de demonstração caso esteja vazia.
 */
export async function seedDatabaseIfEmpty(): Promise<void> {
  const countLojas = await db.lojas.count();
  if (countLojas === 0) {
    console.log('🌱 Inicializando a Base de Dados Relacional com Dados de Exemplo...');
    await db.transaction('rw', [
      db.lojas,
      db.categorias,
      db.produtos,
      db.historico_precos,
      db.listas_compras,
      db.itens_lista,
      db.sugestoes_historico
    ], async () => {
      await db.lojas.bulkAdd(INITIAL_LOJAS);
      await db.categorias.bulkAdd(INITIAL_CATEGORIAS);
      await db.produtos.bulkAdd(INITIAL_PRODUTOS);
      await db.historico_precos.bulkAdd(INITIAL_HISTORICO_PRECOS);
      await db.listas_compras.bulkAdd(INITIAL_LISTAS);
      await db.itens_lista.bulkAdd(INITIAL_ITENS_LISTA);
      await db.sugestoes_historico.bulkAdd(INITIAL_SUGESTOES);
    });
    console.log('✅ Base de dados inicializada com sucesso!');
  }
}

/**
 * Guarda um termo ou valor inserido pelo utilizador nas tabelas de histórico sugestões para autocomplete.
 */
export async function salvarNoHistorico(
  tipo: 'produto' | 'categoria' | 'quantidade' | 'loja',
  valor: string
): Promise<void> {
  const cleanValor = valor?.trim();
  if (!cleanValor) return;
  
  const id = `${tipo}:${cleanValor.toLowerCase()}`;
  try {
    await db.sugestoes_historico.put({
      id,
      tipo,
      valor: cleanValor
    });
  } catch (err) {
    console.error('Erro ao guardar no histórico de sugestões:', err);
  }
}

// ====================================================================
// FUNÇÕES AUXILIARES DE CONSULTA RELACIONAL & COMPARATIVO DE PREÇOS
// ====================================================================

/**
 * Obter o comparativo de preços para um produto específico em todas as lojas
 */
export async function getComparativoPrecosProduto(produtoId: string): Promise<ComparativoPrecoProduto | null> {
  const produto = await db.produtos.get(produtoId);
  if (!produto) return null;

  const categoria = await db.categorias.get(produto.categoria_id);
  const historico = await db.historico_precos.where('produto_id').equals(produtoId).toArray();
  const lojas = await db.lojas.toArray();

  const lojaMap = new Map(lojas.map((l) => [l.id, l]));

  if (historico.length === 0) {
    return {
      produto_id: produto.id,
      produto_nome: produto.nome,
      categoria_nome: categoria?.nome || 'Sem Categoria',
      historico: [],
    };
  }

  // Agrupar último preço por loja
  const ultimosPrecosPorLoja = new Map<string, HistoricoPreco>();
  historico.forEach((hp) => {
    const existente = ultimosPrecosPorLoja.get(hp.loja_id);
    if (!existente || new Date(hp.data) > new Date(existente.data)) {
      ultimosPrecosPorLoja.set(hp.loja_id, hp);
    }
  });

  const precosOrdenados = Array.from(ultimosPrecosPorLoja.values()).sort((a, b) => a.preco - b.preco);
  const maisBarato = precosOrdenados[0];
  const maisCaro = precosOrdenados[precosOrdenados.length - 1];

  const lojaMaisBarata = maisBarato ? {
    loja_id: maisBarato.loja_id,
    loja_nome: lojaMap.get(maisBarato.loja_id)?.nome || 'Loja Desconhecida',
    preco: maisBarato.preco,
    data: maisBarato.data,
    em_promocao: !!maisBarato.em_promocao,
  } : undefined;

  const lojaMaisCara = maisCaro ? {
    loja_id: maisCaro.loja_id,
    loja_nome: lojaMap.get(maisCaro.loja_id)?.nome || 'Loja Desconhecida',
    preco: maisCaro.preco,
  } : undefined;

  const diferenca_percentual = (lojaMaisBarata && lojaMaisCara && lojaMaisCara.preco > 0)
    ? Math.round(((lojaMaisCara.preco - lojaMaisBarata.preco) / lojaMaisCara.preco) * 100)
    : 0;

  return {
    produto_id: produto.id,
    produto_nome: produto.nome,
    categoria_nome: categoria?.nome || 'Sem Categoria',
    loja_mais_barata: lojaMaisBarata,
    loja_mais_cara: lojaMaisCara,
    diferenca_percentual,
    historico,
  };
}

/**
 * Obter uma lista de compras detalhada com relacionamentos (Produtos, Categorias, Lojas e Preços)
 * Adaptada para resolver por correspondência de texto para manter compatibilidade com catalogação
 */
export async function getListaComprasDetalhada(listaId: string): Promise<ListaComprasDetalhada | null> {
  const lista = await db.listas_compras.get(listaId);
  if (!lista) return null;

  const itensRaw = await db.itens_lista.where('lista_id').equals(listaId).toArray();
  const produtos = await db.produtos.toArray();
  const categorias = await db.categorias.toArray();
  const lojas = await db.lojas.toArray();
  const historicoPrecos = await db.historico_precos.toArray();

  // Indexar catálogos por nome para enriquecimento de DTO
  const prodMapByNome = new Map(produtos.map((p) => [p.nome.toLowerCase(), p]));
  const catMapByNome = new Map(categorias.map((c) => [c.nome.toLowerCase(), c]));
  const lojaMapByNome = new Map(lojas.map((l) => [l.nome.toLowerCase(), l]));

  const itensDetalhados: ItemListaDetalhado[] = itensRaw.map((item) => {
    // Tentar resolver objetos estáticos se houver correspondência pelo nome
    const prod = prodMapByNome.get(item.nome_produto.toLowerCase());
    const catObj = item.categoria ? catMapByNome.get(item.categoria.toLowerCase()) : undefined;
    const lojaObj = item.loja ? lojaMapByNome.get(item.loja.toLowerCase()) : undefined;

    // Encontrar melhor preço registado para o produto correspondente se existir
    let precoMaisBaixo: number | undefined = undefined;
    let lojaMaisBarataNome: string | undefined = undefined;

    if (prod) {
      const precosProd = historicoPrecos.filter((h) => h.produto_id === prod.id);
      precosProd.sort((a, b) => a.preco - b.preco);
      const minPrecoObj = precosProd[0];
      if (minPrecoObj) {
        precoMaisBaixo = minPrecoObj.preco;
        lojaMaisBarataNome = lojas.find((l) => l.id === minPrecoObj.loja_id)?.nome;
      }
    }

    return {
      ...item,
      produto: prod,
      categoria_obj: catObj,
      loja_obj: lojaObj,
      preco_mais_baixo_atual: precoMaisBaixo,
      loja_mais_barata_nome: lojaMaisBarataNome,
    };
  });

  const total_itens = itensDetalhados.length;
  const itens_concluidos = itensDetalhados.filter((i) => i.estado === 'comprado').length;

  const custo_total_estimado = itensDetalhados.reduce((acc, item) => {
    const precoUnitario = item.preco ?? item.preco_mais_baixo_atual ?? 0;
    return acc + (precoUnitario * item.quantidade);
  }, 0);

  const custo_total_real = itensDetalhados.reduce((acc, item) => {
    if (item.estado === 'comprado' && item.preco) {
      return acc + (item.preco * item.quantidade);
    }
    return acc;
  }, 0);

  return {
    ...lista,
    itens: itensDetalhados,
    total_itens,
    itens_concluidos,
    custo_total_estimado,
    custo_total_real,
  };
}

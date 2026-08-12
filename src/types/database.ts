/**
 * Tipos e Interfaces da Base de Dados Relacional
 * Aplicação de Lista de Compras, Stock de Casa e Comparativo de Preços
 */

// Enums de Estado
export type EstadoLista = 'aberta' | 'fechada';
export type EstadoItem = 'pendente' | 'comprado';

// 1. Entidade: Loja
export interface Loja {
  id: string;
  nome: string;
  cor_identificadora?: string;
  localizacao?: string;
  criado_em?: string;
}

// 2. Entidade: Categoria
export interface Categoria {
  id: string;
  nome: string;
  icone?: string;
  cor_badge?: string;
  criado_em?: string;
}

// 3. Entidade: Produto (Catálogo Base & Controlo de Stock)
export interface Produto {
  id: string;
  nome: string;
  categoria_id: string;
  unidade_medida?: 'un' | 'kg' | 'g' | 'L' | 'ml' | 'pack';
  imagem_url?: string;
  stock_atual: number;
  stock_minimo: number;
  criado_em?: string;
}

// 4. Entidade: Histórico de Preços (Comparativo de Preços)
export interface HistoricoPreco {
  id: string;
  produto_id: string;
  loja_id: string;
  preco: number;
  data: string; // YYYY-MM-DD
  em_promocao?: boolean;
  observacao?: string;
  criado_em?: string;
}

// 5. Entidade: Lista de Compras
export interface ListaCompras {
  id: string;
  nome_lista: string;
  data_criacao: string;
  estado: EstadoLista;
  orcamento_estimado?: number;
  atualizado_em?: string;
}

// 6. Entidade: Item da Lista
export interface ItemLista {
  id: string;
  lista_id: string;
  produto_id: string;
  loja_preferencial_id?: string;
  quantidade: number;
  estado: EstadoItem;
  preco_unitario_pago?: number;
  notas?: string;
  criado_em?: string;
}

// ====================================================================
// DTOs & Vistas Agregadas para UX (Preço Mais Baixo, Stock Alerta, etc.)
// ====================================================================

export interface ComparativoPrecoProduto {
  produto_id: string;
  produto_nome: string;
  categoria_nome: string;
  loja_mais_barata?: {
    loja_id: string;
    loja_nome: string;
    preco: number;
    data: string;
    em_promocao: boolean;
  };
  loja_mais_cara?: {
    loja_id: string;
    loja_nome: string;
    preco: number;
  };
  diferenca_percentual?: number;
  historico: HistoricoPreco[];
}

export interface ItemListaDetalhado extends ItemLista {
  produto?: Produto;
  categoria?: Categoria;
  loja_preferencial?: Loja;
  preco_mais_baixo_atual?: number;
  loja_mais_barata_nome?: string;
}

export interface ListaComprasDetalhada extends ListaCompras {
  itens: ItemListaDetalhado[];
  total_itens: number;
  itens_concluidos: number;
  custo_total_estimado: number;
  custo_total_real: number;
}

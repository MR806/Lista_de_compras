import { Loja, Categoria, Produto, HistoricoPreco, ListaCompras, ItemLista, SugestaoHistorico } from '../types/database';

export const INITIAL_LOJAS: Loja[] = [
  { id: 'loj-1', nome: 'Continente', cor_identificadora: '#E30613', localizacao: 'Supermercado Central', criado_em: '2026-08-01T10:00:00Z' },
  { id: 'loj-2', nome: 'Pingo Doce', cor_identificadora: '#006837', localizacao: 'Av. Principal', criado_em: '2026-08-01T10:00:00Z' },
  { id: 'loj-3', nome: 'Mercadona', cor_identificadora: '#008552', localizacao: 'Zona Industrial', criado_em: '2026-08-01T10:00:00Z' },
  { id: 'loj-4', nome: 'Lidl', cor_identificadora: '#0050AA', localizacao: 'Bairro Alto', criado_em: '2026-08-01T10:00:00Z' },
  { id: 'loj-5', nome: 'Auchan', cor_identificadora: '#D81E05', localizacao: 'Centro Comercial', criado_em: '2026-08-01T10:00:00Z' },
];

export const INITIAL_CATEGORIAS: Categoria[] = [
  { id: 'cat-1', nome: 'Lacticínios & Ovos', icone: 'milk', cor_badge: '#FF9500', criado_em: '2026-08-01T10:00:00Z' },
  { id: 'cat-2', nome: 'Frutas & Legumes', icone: 'apple', cor_badge: '#34C759', criado_em: '2026-08-01T10:00:00Z' },
  { id: 'cat-3', nome: 'Talho & Peixaria', icone: 'drumstick', cor_badge: '#FF3B30', criado_em: '2026-08-01T10:00:00Z' },
  { id: 'cat-4', nome: 'Padaria & Pastelaria', icone: 'sandwich', cor_badge: '#AF52DE', criado_em: '2026-08-01T10:00:00Z' },
  { id: 'cat-5', nome: 'Despensa & Mercearia', icone: 'package', cor_badge: '#5856D6', criado_em: '2026-08-01T10:00:00Z' },
  { id: 'cat-6', nome: 'Bebidas & Sumos', icone: 'cup-soda', cor_badge: '#007AFF', criado_em: '2026-08-01T10:00:00Z' },
  { id: 'cat-7', nome: 'Higiene & Limpeza', icone: 'sparkles', cor_badge: '#5AC8FA', criado_em: '2026-08-01T10:00:00Z' },
];

export const INITIAL_PRODUTOS: Produto[] = [
  { id: 'prod-1', nome: 'Leite Meio Gordo Mimosa (1L)', categoria_id: 'cat-1', unidade_medida: 'L', stock_atual: 4, stock_minimo: 2, criado_em: '2026-08-01T10:00:00Z' },
  { id: 'prod-2', nome: 'Ovos M Classe A (Dúzia)', categoria_id: 'cat-1', unidade_medida: 'pack', stock_atual: 1, stock_minimo: 1, criado_em: '2026-08-01T10:00:00Z' },
  { id: 'prod-3', nome: 'Queijo Fatiado Flamenco Terra de Nostra (200g)', categoria_id: 'cat-1', unidade_medida: 'pack', stock_atual: 0, stock_minimo: 1, criado_em: '2026-08-01T10:00:00Z' },
  
  { id: 'prod-4', nome: 'Banana da Madeira (kg)', categoria_id: 'cat-2', unidade_medida: 'kg', stock_atual: 1.5, stock_minimo: 1, criado_em: '2026-08-01T10:00:00Z' },
  { id: 'prod-5', nome: 'Maçã Fuji Nacional (kg)', categoria_id: 'cat-2', unidade_medida: 'kg', stock_atual: 0.5, stock_minimo: 1, criado_em: '2026-08-01T10:00:00Z' },
  
  { id: 'prod-6', nome: 'Peito de Frango Fresco (kg)', categoria_id: 'cat-3', unidade_medida: 'kg', stock_atual: 2, stock_minimo: 1, criado_em: '2026-08-01T10:00:00Z' },
  { id: 'prod-7', nome: 'Postas de Bacalhau da Noruega (kg)', categoria_id: 'cat-3', unidade_medida: 'kg', stock_atual: 0, stock_minimo: 1, criado_em: '2026-08-01T10:00:00Z' },
  
  { id: 'prod-8', nome: 'Pão de Forma Integral (500g)', categoria_id: 'cat-4', unidade_medida: 'pack', stock_atual: 1, stock_minimo: 1, criado_em: '2026-08-01T10:00:00Z' },
  
  { id: 'prod-9', nome: 'Azeite Virgem Extra Oliveira da Serra (750ml)', categoria_id: 'cat-5', unidade_medida: 'L', stock_atual: 1, stock_minimo: 1, criado_em: '2026-08-01T10:00:00Z' },
  { id: 'prod-10', nome: 'Arroz Carolino Cigala (1kg)', categoria_id: 'cat-5', unidade_medida: 'kg', stock_atual: 3, stock_minimo: 1, criado_em: '2026-08-01T10:00:00Z' },
  { id: 'prod-11', nome: 'Massa Spaghetti Milaneza (500g)', categoria_id: 'cat-5', unidade_medida: 'pack', stock_atual: 2, stock_minimo: 2, criado_em: '2026-08-01T10:00:00Z' },
  
  { id: 'prod-12', nome: 'Detergente Máquina Roupa Skip (40 doses)', categoria_id: 'cat-7', unidade_medida: 'pack', stock_atual: 0, stock_minimo: 1, criado_em: '2026-08-01T10:00:00Z' },
];

export const INITIAL_HISTORICO_PRECOS: HistoricoPreco[] = [
  // Leite
  { id: 'hist-1', produto_id: 'prod-1', loja_id: 'loj-1', preco: 0.99, data: '2026-08-01', em_promocao: false },
  { id: 'hist-2', produto_id: 'prod-1', loja_id: 'loj-2', preco: 0.95, data: '2026-08-02', em_promocao: true },
  { id: 'hist-3', produto_id: 'prod-1', loja_id: 'loj-3', preco: 0.98, data: '2026-08-03', em_promocao: false },

  // Azeite
  { id: 'hist-4', produto_id: 'prod-9', loja_id: 'loj-1', preco: 7.99, data: '2026-08-01', em_promocao: true, observacao: 'Desconto 20%' },
  { id: 'hist-5', produto_id: 'prod-9', loja_id: 'loj-2', preco: 9.49, data: '2026-08-02', em_promocao: false },
  { id: 'hist-6', produto_id: 'prod-9', loja_id: 'loj-4', preco: 7.49, data: '2026-08-04', em_promocao: true },

  // Ovos
  { id: 'hist-7', produto_id: 'prod-2', loja_id: 'loj-1', preco: 2.39, data: '2026-08-01' },
  { id: 'hist-8', produto_id: 'prod-2', loja_id: 'loj-3', preco: 2.19, data: '2026-08-03' },

  // Queijo
  { id: 'hist-9', produto_id: 'prod-3', loja_id: 'loj-1', preco: 2.49, data: '2026-08-01' },
  { id: 'hist-10', produto_id: 'prod-3', loja_id: 'loj-2', preco: 2.29, data: '2026-08-02' },

  // Detergente Skip
  { id: 'hist-11', produto_id: 'prod-12', loja_id: 'loj-1', preco: 14.99, data: '2026-08-01', em_promocao: true },
  { id: 'hist-12', produto_id: 'prod-12', loja_id: 'loj-5', preco: 18.49, data: '2026-08-05', em_promocao: false },
];

export const INITIAL_LISTAS: ListaCompras[] = [
  {
    id: 'lst-1',
    nome_lista: 'Compras da Semana',
    data_criacao: '2026-08-07T14:30:00Z',
    estado: 'aberta',
    orcamento_estimado: 45.00,
    atualizado_em: '2026-08-07T14:30:00Z',
  },
  {
    id: 'lst-2',
    nome_lista: 'Reabastecimento de Mensal',
    data_criacao: '2026-08-01T09:00:00Z',
    estado: 'fechada',
    orcamento_estimado: 120.00,
    atualizado_em: '2026-08-01T11:45:00Z',
  },
];

// Refatorado para o novo modelo de dados com propriedades separadas diretas
export const INITIAL_ITENS_LISTA: ItemLista[] = [
  {
    id: 'itm-1',
    lista_id: 'lst-1',
    nome_produto: 'Queijo Fatiado Flamenco Terra de Nostra (200g)',
    categoria: 'Lacticínios & Ovos',
    loja: 'Pingo Doce',
    quantidade: 2,
    estado: 'pendente',
    nota_adicional: 'Preferência por embalagem poupança',
    criado_em: '2026-08-07T14:30:00Z',
  },
  {
    id: 'itm-2',
    lista_id: 'lst-1',
    nome_produto: 'Maçã Fuji Nacional (kg)',
    categoria: 'Frutas & Legumes',
    loja: 'Continente',
    quantidade: 1.5,
    estado: 'pendente',
    criado_em: '2026-08-07T14:31:00Z',
  },
  {
    id: 'itm-3',
    lista_id: 'lst-1',
    nome_produto: 'Detergente Máquina Roupa Skip (40 doses)',
    categoria: 'Higiene & Limpeza',
    loja: 'Continente',
    quantidade: 1,
    estado: 'comprado',
    preco: 14.99,
    criado_em: '2026-08-07T14:32:00Z',
  },
  {
    id: 'itm-4',
    lista_id: 'lst-1',
    nome_produto: 'Leite Meio Gordo Mimosa (1L)',
    categoria: 'Lacticínios & Ovos',
    loja: 'Pingo Doce',
    quantidade: 6,
    estado: 'comprado',
    preco: 0.95,
    criado_em: '2026-08-07T14:35:00Z',
  },
];

// Dados Iniciais para o Histórico de Autocompletar / Sugestões
export const INITIAL_SUGESTOES: SugestaoHistorico[] = [
  // Sugestões de Produtos
  { id: 'produto:leite meio gordo mimosa (1l)', tipo: 'produto', valor: 'Leite Meio Gordo Mimosa (1L)' },
  { id: 'produto:ovos m classe a (dúzia)', tipo: 'produto', valor: 'Ovos M Classe A (Dúzia)' },
  { id: 'produto:queijo fatiado flamenco terra de nostra (200g)', tipo: 'produto', valor: 'Queijo Fatiado Flamenco Terra de Nostra (200g)' },
  { id: 'produto:banana da madeira (kg)', tipo: 'produto', valor: 'Banana da Madeira (kg)' },
  { id: 'produto:maçã fuji nacional (kg)', tipo: 'produto', valor: 'Maçã Fuji Nacional (kg)' },
  { id: 'produto:peito de frango fresco (kg)', tipo: 'produto', valor: 'Peito de Frango Fresco (kg)' },
  { id: 'produto:postas de bacalhau da noruega (kg)', tipo: 'produto', valor: 'Postas de Bacalhau da Noruega (kg)' },
  { id: 'produto:pão de forma integral (500g)', tipo: 'produto', valor: 'Pão de Forma Integral (500g)' },
  { id: 'produto:azeite virgem extra oliveira da serra (750ml)', tipo: 'produto', valor: 'Azeite Virgem Extra Oliveira da Serra (750ml)' },
  { id: 'produto:arroz carolino cigala (1kg)', tipo: 'produto', valor: 'Arroz Carolino Cigala (1kg)' },
  { id: 'produto:massa spaghetti milaneza (500g)', tipo: 'produto', valor: 'Massa Spaghetti Milaneza (500g)' },
  { id: 'produto:detergente máquina roupa skip (40 doses)', tipo: 'produto', valor: 'Detergente Máquina Roupa Skip (40 doses)' },

  // Sugestões de Categorias
  { id: 'categoria:lacticínios & ovos', tipo: 'categoria', valor: 'Lacticínios & Ovos' },
  { id: 'categoria:frutas & legumes', tipo: 'categoria', valor: 'Frutas & Legumes' },
  { id: 'categoria:talho & peixaria', tipo: 'categoria', valor: 'Talho & Peixaria' },
  { id: 'categoria:padaria & pastelaria', tipo: 'categoria', valor: 'Padaria & Pastelaria' },
  { id: 'categoria:despensa & mercearia', tipo: 'categoria', valor: 'Despensa & Mercearia' },
  { id: 'categoria:bebidas & sumos', tipo: 'categoria', valor: 'Bebidas & Sumos' },
  { id: 'categoria:higiene & limpeza', tipo: 'categoria', valor: 'Higiene & Limpeza' },

  // Sugestões de Lojas
  { id: 'loja:continente', tipo: 'loja', valor: 'Continente' },
  { id: 'loja:pingo doce', tipo: 'loja', valor: 'Pingo Doce' },
  { id: 'loja:mercadona', tipo: 'loja', valor: 'Mercadona' },
  { id: 'loja:lidl', tipo: 'loja', valor: 'Lidl' },
  { id: 'loja:auchan', tipo: 'loja', valor: 'Auchan' },

  // Sugestões de Quantidade comuns
  { id: 'quantidade:1', tipo: 'quantidade', valor: '1' },
  { id: 'quantidade:2', tipo: 'quantidade', valor: '2' },
  { id: 'quantidade:3', tipo: 'quantidade', valor: '3' },
  { id: 'quantidade:4', tipo: 'quantidade', valor: '4' },
  { id: 'quantidade:5', tipo: 'quantidade', valor: '5' },
  { id: 'quantidade:6', tipo: 'quantidade', valor: '6' },
  { id: 'quantidade:1.5', tipo: 'quantidade', valor: '1.5' },
  { id: 'quantidade:0.5', tipo: 'quantidade', valor: '0.5' },
];

-- ====================================================================
-- ESQUEMA DA BASE DE DADOS RELACIONAL: GESTÃO DE COMPRAS E STOCK DA CASA
-- Compatível com SQLite, PostgreSQL e Sistemas ORM/IndexedDB
-- ====================================================================

-- 1. Tabela: Lojas
CREATE TABLE IF NOT EXISTS lojas (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    cor_identificadora VARCHAR(20) DEFAULT '#007AFF', -- Cor no estilo iOS
    localizacao VARCHAR(150),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela: Categorias
CREATE TABLE IF NOT EXISTS categorias (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    icone VARCHAR(50) DEFAULT 'tag',
    cor_badge VARCHAR(20) DEFAULT '#8E8E93',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela: Produtos (Catálogo Base & Stock de Casa)
CREATE TABLE IF NOT EXISTS produtos (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    categoria_id VARCHAR(36) NOT NULL,
    unidade_medida VARCHAR(20) DEFAULT 'un', -- un, kg, g, L, ml, embalagem
    imagem_url TEXT,
    stock_atual NUMERIC(10, 2) DEFAULT 0,
    stock_minimo NUMERIC(10, 2) DEFAULT 1,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_produtos_categoria 
        FOREIGN KEY (categoria_id) 
        REFERENCES categorias(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
);

-- 4. Tabela: Historico_Precos (Comparativo de Preços por Loja)
CREATE TABLE IF NOT EXISTS historico_precos (
    id VARCHAR(36) PRIMARY KEY,
    produto_id VARCHAR(36) NOT NULL,
    loja_id VARCHAR(36) NOT NULL,
    preco NUMERIC(10, 2) NOT NULL CHECK (preco >= 0),
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    em_promocao BOOLEAN DEFAULT FALSE,
    observacao TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_historico_produto 
        FOREIGN KEY (produto_id) 
        REFERENCES produtos(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_historico_loja 
        FOREIGN KEY (loja_id) 
        REFERENCES lojas(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

-- 5. Tabela: Listas_Compras
CREATE TABLE IF NOT EXISTS listas_compras (
    id VARCHAR(36) PRIMARY KEY,
    nome_lista VARCHAR(150) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('aberta', 'fechada')),
    orcamento_estimado NUMERIC(10, 2) DEFAULT NULL,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabela: Itens_Lista
CREATE TABLE IF NOT EXISTS itens_lista (
    id VARCHAR(36) PRIMARY KEY,
    lista_id VARCHAR(36) NOT NULL,
    produto_id VARCHAR(36) NOT NULL,
    loja_preferencial_id VARCHAR(36), -- Opcional: loja selecionada para esta compra
    quantidade NUMERIC(10, 2) NOT NULL DEFAULT 1 CHECK (quantidade > 0),
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('pendente', 'comprado')),
    preco_unitario_pago NUMERIC(10, 2) DEFAULT NULL,
    notas TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_itens_lista 
        FOREIGN KEY (lista_id) 
        REFERENCES listas_compras(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_itens_produto 
        FOREIGN KEY (produto_id) 
        REFERENCES produtos(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_itens_loja 
        FOREIGN KEY (loja_preferencial_id) 
        REFERENCES lojas(id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
);

-- ====================================================================
-- ÍNDICES DE DESEMPENHO (Otimização para pesquisas rápidos e agregações)
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_historico_precos_prod_loja ON historico_precos(produto_id, loja_id);
CREATE INDEX IF NOT EXISTS idx_historico_precos_data ON historico_precos(data DESC);
CREATE INDEX IF NOT EXISTS idx_itens_lista_lista ON itens_lista(lista_id);
CREATE INDEX IF NOT EXISTS idx_itens_lista_estado ON itens_lista(estado);

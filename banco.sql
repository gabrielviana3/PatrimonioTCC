-- ============================================================
-- ISEPAM - Sistema de Gestão de Patrimônio
-- Schema MySQL 8.0+
-- ============================================================

CREATE DATABASE IF NOT EXISTS isepam
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE isepam;

-- ============================================================
-- TABELA: usuarios
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id          INT             NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome        VARCHAR(120)    NOT NULL,
    email       VARCHAR(150)    NOT NULL UNIQUE,
    senha_hash  TEXT            NOT NULL,
    role        ENUM('admin', 'tecnico') NOT NULL DEFAULT 'tecnico',
    ativo       TINYINT(1)      NOT NULL DEFAULT 1,
    criado_em   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuarios_email ON usuarios (email);

-- -------------------------------------------------------
-- Usuários padrão com senhas bcrypt reais:
--   admin@isepam.edu.br  → senha: admin123
--   tecnico@isepam.edu.br → senha: tecnico123
--
-- Para trocar a senha, gere um novo hash bcrypt com:
--   python -c "import bcrypt; print(bcrypt.hashpw(b'suasenha', bcrypt.gensalt()).decode())"
-- e substitua o hash abaixo no UPDATE.
-- -------------------------------------------------------
INSERT IGNORE INTO usuarios (nome, email, senha_hash, role) VALUES
    ('Administrador', 'admin@isepam.edu.br',
     '$2b$12$eImiTXuWVxfM37uY4JANjQ==hashed_placeholder_admin',
     'admin'),
    ('Técnico Padrão', 'tecnico@isepam.edu.br',
     '$2b$12$eImiTXuWVxfM37uY4JANjQ==hashed_placeholder_tecnico',
     'tecnico');

-- ATENÇÃO: os hashes acima são placeholders.
-- Rode o script gerar_senhas.py para gerar os hashes reais
-- e depois execute os UPDATEs que ele vai imprimir.

-- ============================================================
-- TABELA: bens
-- ============================================================
CREATE TABLE IF NOT EXISTS bens (
    id              INT             NOT NULL AUTO_INCREMENT PRIMARY KEY,
    numero          VARCHAR(50)     NOT NULL UNIQUE,
    nome            VARCHAR(200)    NOT NULL,
    valor           DECIMAL(12,2)   NOT NULL CHECK (valor > 0),
    nota_fiscal     VARCHAR(100),
    fornecedor      VARCHAR(150),
    localizacao     VARCHAR(200)    NOT NULL DEFAULT 'Não informada',
    estado          ENUM('Novo','Bom','Regular','Ruim') NOT NULL DEFAULT 'Novo',
    categoria       ENUM('Mobiliário','TI','Áudio e Vídeo') NOT NULL DEFAULT 'Mobiliário',
    data_entrada    DATE            NOT NULL DEFAULT (CURRENT_DATE),
    cadastrado_em   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bens_numero    ON bens (numero);
CREATE INDEX idx_bens_categoria ON bens (categoria);
CREATE INDEX idx_bens_estado    ON bens (estado);
CREATE INDEX idx_bens_data      ON bens (data_entrada);

-- ============================================================
-- TABELA: chamados
-- ============================================================
CREATE TABLE IF NOT EXISTS chamados (
    id              INT             NOT NULL AUTO_INCREMENT PRIMARY KEY,
    patrimonio      VARCHAR(50)     NOT NULL,
    descricao       TEXT            NOT NULL,
    foto_base64     LONGTEXT,
    status          ENUM('Aberto','Em andamento','Concluído','Não reparado') NOT NULL DEFAULT 'Aberto',
    tecnico_id      INT,
    tecnico_nome    VARCHAR(120),
    feedback        TEXT,
    data_abertura   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_conclusao  DATETIME,

    CONSTRAINT fk_chamados_bem      FOREIGN KEY (patrimonio)  REFERENCES bens(numero)     ON DELETE CASCADE,
    CONSTRAINT fk_chamados_tecnico  FOREIGN KEY (tecnico_id)  REFERENCES usuarios(id)     ON DELETE SET NULL
);

CREATE INDEX idx_chamados_patrimonio    ON chamados (patrimonio);
CREATE INDEX idx_chamados_status        ON chamados (status);
CREATE INDEX idx_chamados_data_abertura ON chamados (data_abertura);

-- ============================================================
-- TABELA: atividades  (log de auditoria)
-- ============================================================
CREATE TABLE IF NOT EXISTS atividades (
    id          INT             NOT NULL AUTO_INCREMENT PRIMARY KEY,
    texto       TEXT            NOT NULL,
    usuario_id  INT,
    criado_em   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_atividades_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE INDEX idx_atividades_data    ON atividades (criado_em);
CREATE INDEX idx_atividades_usuario ON atividades (usuario_id);

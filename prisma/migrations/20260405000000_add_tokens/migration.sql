-- Migration: Adiciona tabela de tokens para triagem externa
-- Task 3: API — Ingestão de Dados e Validação de Token

CREATE TABLE tokens (
    -- Identificador único interno (UUID gerado pelo banco)
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- O token em si: string curta e única enviada ao responsável/professor
    token          VARCHAR(64) UNIQUE NOT NULL,

    -- Qual aluno esta triagem pertence
    student_id     UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,

    -- Qual questionário (assessment) será respondido
    assessment_id  UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,

    -- Controle de uso: FALSE = disponível, TRUE = já foi utilizado (invalidado)
    is_used        BOOLEAN NOT NULL DEFAULT FALSE,

    -- Data de expiração opcional (ex: 7 dias após criação)
    expires_at     TIMESTAMPTZ,

    -- Quando o token foi de fato utilizado para submissão
    used_at        TIMESTAMPTZ,

    created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para acelerar a busca pelo valor do token (será chamado a cada request)
CREATE INDEX idx_tokens_token ON tokens(token);

-- Índice para buscar todos os tokens de um aluno
CREATE INDEX idx_tokens_student_id ON tokens(student_id);
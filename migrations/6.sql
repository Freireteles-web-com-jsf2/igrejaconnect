-- Migration 6: Adicionar campos Sexo e Estado Civil à tabela members

-- Adicionar colunas à tabela members
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('masculino', 'feminino', 'outro')),
ADD COLUMN IF NOT EXISTS marital_status TEXT CHECK (marital_status IN ('solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel'));

-- Comentários para documentação
COMMENT ON COLUMN members.gender IS 'Sexo do membro: masculino, feminino, outro';
COMMENT ON COLUMN members.marital_status IS 'Estado civil: solteiro, casado, divorciado, viuvo, uniao_estavel';
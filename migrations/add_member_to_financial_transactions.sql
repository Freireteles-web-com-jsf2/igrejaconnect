-- Migration: Adicionar relacionamento com membros na tabela financial_transactions
-- Data: 2025-01-31

-- Adicionar coluna member_id para relacionar transações com membros
ALTER TABLE public.financial_transactions 
ADD COLUMN member_id INTEGER REFERENCES public.members(id) ON DELETE SET NULL;

-- Criar índice para melhorar performance das consultas
CREATE INDEX IF NOT EXISTS idx_financial_transactions_member_id 
ON public.financial_transactions(member_id);

-- Comentário na coluna
COMMENT ON COLUMN public.financial_transactions.member_id IS 'Referência ao membro relacionado à transação (especialmente para dízimos)';
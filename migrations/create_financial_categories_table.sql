-- Migration: Criar tabela de categorias financeiras
-- Data: 2025-01-31

-- Criar tabela de categorias financeiras
CREATE TABLE IF NOT EXISTS public.financial_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('receita', 'despesa')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir categorias padrão de receita
INSERT INTO public.financial_categories (name, type) VALUES
  ('Dízimos', 'receita'),
  ('Ofertas', 'receita'),
  ('Doações', 'receita'),
  ('Eventos', 'receita'),
  ('Vendas', 'receita'),
  ('Outros', 'receita');

-- Inserir categorias padrão de despesa
INSERT INTO public.financial_categories (name, type) VALUES
  ('Aluguel', 'despesa'),
  ('Energia Elétrica', 'despesa'),
  ('Água', 'despesa'),
  ('Internet/Telefone', 'despesa'),
  ('Material de Limpeza', 'despesa'),
  ('Material de Escritório', 'despesa'),
  ('Equipamentos', 'despesa'),
  ('Manutenção', 'despesa'),
  ('Eventos', 'despesa'),
  ('Missões', 'despesa'),
  ('Ajuda Social', 'despesa'),
  ('Outros', 'despesa');

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_financial_categories_type ON public.financial_categories(type);
CREATE INDEX IF NOT EXISTS idx_financial_categories_active ON public.financial_categories(is_active);

-- Criar trigger para updated_at
CREATE TRIGGER update_financial_categories_updated_at 
  BEFORE UPDATE ON financial_categories 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE financial_categories ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Enable read access for authenticated users" ON financial_categories FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON financial_categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON financial_categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON financial_categories FOR DELETE USING (auth.role() = 'authenticated');

-- Comentários
COMMENT ON TABLE public.financial_categories IS 'Categorias para transações financeiras';
COMMENT ON COLUMN public.financial_categories.name IS 'Nome da categoria';
COMMENT ON COLUMN public.financial_categories.type IS 'Tipo da categoria (receita ou despesa)';
COMMENT ON COLUMN public.financial_categories.is_active IS 'Se a categoria está ativa para uso';
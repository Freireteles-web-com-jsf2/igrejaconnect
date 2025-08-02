-- Migration 7: Configurações da Igreja
-- Execute este script no SQL Editor do Supabase

-- Criar tabela de configurações da igreja
CREATE TABLE IF NOT EXISTS public.church_settings (
  id SERIAL PRIMARY KEY,
  church_name TEXT NOT NULL DEFAULT 'Minha Igreja',
  church_address TEXT,
  church_phone TEXT,
  church_email TEXT,
  church_website TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3B82F6',
  secondary_color TEXT DEFAULT '#10B981',
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  currency TEXT DEFAULT 'BRL',
  language TEXT DEFAULT 'pt-BR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configurar Row Level Security (RLS)
ALTER TABLE church_settings ENABLE ROW LEVEL SECURITY;

-- Criar política de segurança (apenas usuários autenticados podem ver/editar)
CREATE POLICY "Enable all for authenticated users" ON church_settings 
  FOR ALL USING (auth.role() = 'authenticated');

-- Inserir configurações padrão
INSERT INTO church_settings (
  church_name, 
  church_address, 
  church_phone, 
  church_email,
  primary_color,
  secondary_color
) VALUES (
  'IgrejaConnect',
  'Rua da Igreja, 123 - Centro',
  '(11) 99999-9999',
  'contato@igrejaconnect.com.br',
  '#3B82F6',
  '#10B981'
) ON CONFLICT DO NOTHING;

-- Comentários para documentação
COMMENT ON TABLE church_settings IS 'Configurações gerais da igreja';
COMMENT ON COLUMN church_settings.primary_color IS 'Cor primária do tema (hex)';
COMMENT ON COLUMN church_settings.secondary_color IS 'Cor secundária do tema (hex)';
COMMENT ON COLUMN church_settings.timezone IS 'Fuso horário da igreja';
COMMENT ON COLUMN church_settings.currency IS 'Moeda padrão (BRL, USD, EUR, etc)';
COMMENT ON COLUMN church_settings.language IS 'Idioma padrão (pt-BR, en-US, es-ES, etc)';
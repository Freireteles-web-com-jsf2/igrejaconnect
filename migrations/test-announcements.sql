-- Teste: Criar tabela announcements básica
-- Execute este script no SQL Editor do Supabase

-- Verificar se a tabela existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'announcements';

-- Se não existir, criar uma versão básica
CREATE TABLE IF NOT EXISTS public.announcements (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  announcement_type TEXT DEFAULT 'general',
  target_audience TEXT DEFAULT 'all',
  priority TEXT DEFAULT 'normal',
  is_published BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configurar RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Política simples
CREATE POLICY "Enable all for authenticated users" ON announcements 
  FOR ALL USING (auth.role() = 'authenticated');

-- Inserir um aviso de teste
INSERT INTO announcements (title, content, announcement_type, target_audience, is_published, published_at) 
VALUES ('Teste do Sistema', 'Este é um aviso de teste para verificar se o sistema está funcionando.', 'general', 'all', true, NOW())
ON CONFLICT DO NOTHING;
-- Migration 8: Sistema de Comunicação
-- Execute este script no SQL Editor do Supabase

-- Criar tabela de avisos e comunicados
CREATE TABLE IF NOT EXISTS public.announcements (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  announcement_type TEXT NOT NULL DEFAULT 'general' CHECK(announcement_type IN ('general', 'urgent', 'department', 'event', 'financial')),
  target_audience TEXT NOT NULL DEFAULT 'all' CHECK(target_audience IN ('all', 'members', 'leaders', 'department', 'specific')),
  department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  priority TEXT DEFAULT 'normal' CHECK(priority IN ('low', 'normal', 'high', 'urgent')),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_published BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de leituras de avisos (para controle de quem já leu)
CREATE TABLE IF NOT EXISTS public.announcement_reads (
  id SERIAL PRIMARY KEY,
  announcement_id INTEGER NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(announcement_id, user_id)
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_announcements_type ON announcements(announcement_type);
CREATE INDEX IF NOT EXISTS idx_announcements_audience ON announcements(target_audience);
CREATE INDEX IF NOT EXISTS idx_announcements_published ON announcements(is_published);
CREATE INDEX IF NOT EXISTS idx_announcements_expires ON announcements(expires_at);
CREATE INDEX IF NOT EXISTS idx_announcements_created ON announcements(created_at);
CREATE INDEX IF NOT EXISTS idx_announcement_reads_announcement ON announcement_reads(announcement_id);
CREATE INDEX IF NOT EXISTS idx_announcement_reads_user ON announcement_reads(user_id);

-- Configurar Row Level Security (RLS)
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_reads ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "Enable all for authenticated users" ON announcements 
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON announcement_reads 
  FOR ALL USING (auth.role() = 'authenticated');

-- Inserir avisos de exemplo
INSERT INTO announcements (
  title, 
  content, 
  announcement_type, 
  target_audience, 
  priority, 
  is_published,
  is_pinned,
  created_by,
  published_at
) VALUES 
(
  'Bem-vindos ao IgrejaConnect!',
  'Estamos felizes em apresentar o novo sistema de gestão da nossa igreja. Aqui você encontrará todas as informações importantes sobre nossa comunidade.',
  'general',
  'all',
  'high',
  true,
  true,
  (SELECT id FROM auth.users LIMIT 1),
  NOW()
),
(
  'Culto Especial de Ação de Graças',
  'No próximo domingo teremos um culto especial de ação de graças. Venha participar conosco deste momento de gratidão e louvor.',
  'event',
  'all',
  'normal',
  true,
  false,
  (SELECT id FROM auth.users LIMIT 1),
  NOW()
),
(
  'Reunião de Líderes - Agosto',
  'Convocamos todos os líderes de departamento para a reunião mensal que acontecerá na próxima terça-feira às 19h30.',
  'department',
  'leaders',
  'high',
  true,
  false,
  (SELECT id FROM auth.users LIMIT 1),
  NOW()
)
ON CONFLICT DO NOTHING;

-- Comentários para documentação
COMMENT ON TABLE announcements IS 'Avisos e comunicados da igreja';
COMMENT ON TABLE announcement_reads IS 'Controle de leitura dos avisos pelos usuários';
COMMENT ON COLUMN announcements.announcement_type IS 'Tipo: general, urgent, department, event, financial';
COMMENT ON COLUMN announcements.target_audience IS 'Público-alvo: all, members, leaders, department, specific';
COMMENT ON COLUMN announcements.priority IS 'Prioridade: low, normal, high, urgent';
COMMENT ON COLUMN announcements.expires_at IS 'Data de expiração do aviso (opcional)';
COMMENT ON COLUMN announcements.is_published IS 'Se o aviso está publicado e visível';
COMMENT ON COLUMN announcements.is_pinned IS 'Se o aviso está fixado no topo';
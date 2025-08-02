-- Migration 11: Inserir dados manualmente (versão que funciona)
-- Execute este script no SQL Editor do Supabase

-- Primeiro, vamos verificar a estrutura da tabela events
-- Se created_by for obrigatório, vamos usar um valor padrão

-- Inserir apenas avisos (que não dependem de created_by obrigatório)
INSERT INTO announcements (
  title, 
  content, 
  announcement_type, 
  target_audience, 
  priority,
  is_published,
  is_pinned,
  published_at
) VALUES 
(
  'Sistema IgrejaConnect Operacional',
  'O sistema de gestão da igreja está totalmente funcional com dados reais sincronizados.',
  'general',
  'all',
  'high',
  true,
  true,
  NOW()
),
(
  'Dados Reais Carregados',
  'Membros, departamentos e transações financeiras foram carregados com sucesso no sistema.',
  'general',
  'all',
  'normal',
  true,
  false,
  NOW()
)
ON CONFLICT DO NOTHING;
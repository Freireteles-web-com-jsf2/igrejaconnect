-- Migration 10: Inserir eventos simples (sem created_by)
-- Execute este script no SQL Editor do Supabase

-- Verificar se a tabela events permite created_by como NULL
-- Se não permitir, vamos inserir sem esse campo

-- Inserir eventos básicos
INSERT INTO events (title, description, event_type, start_datetime, end_datetime, location, is_active) VALUES
('Culto Dominical Matutino', 'Culto de adoração e pregação da palavra', 'culto', '2025-08-03 10:00:00+00', '2025-08-03 12:00:00+00', 'Templo Principal', true),
('Culto Dominical Vespertino', 'Culto de louvor e ministração', 'culto', '2025-08-03 18:00:00+00', '2025-08-03 20:00:00+00', 'Templo Principal', true),
('Reunião de Oração', 'Reunião semanal de oração', 'reuniao', '2025-08-06 19:30:00+00', '2025-08-06 21:00:00+00', 'Sala de Oração', true),
('Escola Bíblica Dominical', 'Estudo bíblico para todas as idades', 'reuniao', '2025-08-03 09:00:00+00', '2025-08-03 09:45:00+00', 'Salas de Aula', true),
('Conferência de Jovens 2025', 'Evento especial para jovens', 'evento_especial', '2025-08-15 19:00:00+00', '2025-08-15 22:00:00+00', 'Auditório', true)
ON CONFLICT DO NOTHING;

-- Inserir avisos básicos (sem created_by)
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
  'Bem-vindos ao IgrejaConnect!',
  'Sistema de gestão da igreja totalmente funcional com dados reais. Todas as funcionalidades estão operacionais e sincronizadas.',
  'general',
  'all',
  'high',
  true,
  true,
  NOW()
),
(
  'Conferência de Jovens 2025',
  'Não percam a Conferência de Jovens que acontecerá no dia 15 de agosto às 19h. Será uma noite especial!',
  'event',
  'all',
  'normal',
  true,
  false,
  NOW()
),
(
  'Sistema Totalmente Funcional',
  'Todas as funcionalidades do IgrejaConnect estão operacionais: membros, departamentos, finanças, eventos, relatórios e comunicação.',
  'general',
  'all',
  'normal',
  true,
  false,
  NOW()
)
ON CONFLICT DO NOTHING;
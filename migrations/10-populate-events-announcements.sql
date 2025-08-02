-- Migration 10: Inserir eventos e avisos (Execute APÓS ter pelo menos um usuário logado)
-- Execute este script no SQL Editor do Supabase

-- Primeiro, vamos verificar se existe pelo menos um usuário
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Pegar o primeiro usuário disponível
    SELECT id INTO user_uuid FROM auth.users LIMIT 1;
    
    -- Se houver usuário, inserir eventos e avisos
    IF user_uuid IS NOT NULL THEN
        -- Inserir eventos
        INSERT INTO events (title, description, event_type, start_datetime, end_datetime, location, created_by, is_active) VALUES
        ('Culto Dominical Matutino', 'Culto de adoração e pregação da palavra', 'culto', '2025-08-03 10:00:00', '2025-08-03 12:00:00', 'Templo Principal', user_uuid, true),
        ('Reunião de Oração', 'Reunião semanal de oração', 'reuniao', '2025-08-06 19:30:00', '2025-08-06 21:00:00', 'Sala de Oração', user_uuid, true),
        ('Conferência de Jovens', 'Evento especial para jovens', 'evento_especial', '2025-08-15 19:00:00', '2025-08-15 22:00:00', 'Auditório', user_uuid, true)
        ON CONFLICT DO NOTHING;

        -- Inserir avisos
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
          'Sistema de gestão da igreja totalmente funcional com dados reais.',
          'general',
          'all',
          'high',
          true,
          true,
          user_uuid,
          NOW()
        ),
        (
          'Conferência de Jovens 2025',
          'Evento especial no dia 15 de agosto às 19h.',
          'event',
          'all',
          'normal',
          true,
          false,
          user_uuid,
          NOW()
        )
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Eventos e avisos inseridos com sucesso usando user_id: %', user_uuid;
    ELSE
        RAISE NOTICE 'Nenhum usuário encontrado. Faça login primeiro e execute novamente.';
    END IF;
END $$;
-- Inserir eventos de exemplo
-- Execute APÓS criar a tabela events

-- Primeiro, obter um usuário válido ou usar um UUID padrão
DO $$
DECLARE
    sample_user_id UUID;
BEGIN
    -- Tentar pegar um usuário existente
    SELECT id INTO sample_user_id FROM auth.users LIMIT 1;
    
    -- Se não houver usuário, usar um UUID padrão (você pode substituir pelo seu UUID)
    IF sample_user_id IS NULL THEN
        sample_user_id := '00000000-0000-0000-0000-000000000000';
    END IF;
    
    -- Inserir eventos de exemplo
    INSERT INTO events (title, description, event_type, start_datetime, end_datetime, location, created_by, is_active) VALUES
    ('Culto Dominical', 'Culto de adoração e pregação da palavra', 'culto', '2025-08-03 10:00:00+00', '2025-08-03 12:00:00+00', 'Templo Principal', sample_user_id, true),
    ('Reunião de Oração', 'Reunião semanal de oração e intercessão', 'reuniao', '2025-08-01 19:30:00+00', '2025-08-01 21:00:00+00', 'Sala de Oração', sample_user_id, true),
    ('Conferência de Jovens', 'Evento especial para a juventude da igreja', 'evento_especial', '2025-08-10 19:00:00+00', '2025-08-10 22:00:00+00', 'Auditório', sample_user_id, true),
    ('Escola Bíblica Dominical', 'Estudo bíblico para todas as idades', 'reuniao', '2025-08-03 09:00:00+00', '2025-08-03 09:45:00+00', 'Salas de Aula', sample_user_id, true),
    ('Vigília de Ano Novo', 'Vigília especial de passagem de ano', 'evento_especial', '2025-12-31 22:00:00+00', '2026-01-01 01:00:00+00', 'Templo Principal', sample_user_id, true)
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Eventos inseridos com sucesso usando user_id: %', sample_user_id;
END $$;
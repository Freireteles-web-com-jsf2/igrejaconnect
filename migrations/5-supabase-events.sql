-- Migration 5: Sistema de Eventos para Supabase (PostgreSQL)
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela de eventos
CREATE TABLE IF NOT EXISTS public.events (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL CHECK(length(title) >= 3 AND length(title) <= 100),
  description TEXT CHECK(length(description) <= 500),
  event_type TEXT NOT NULL CHECK(event_type IN ('culto', 'reuniao', 'evento_especial')),
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE,
  location TEXT CHECK(length(location) <= 200),
  max_participants INTEGER CHECK(max_participants > 0),
  requires_confirmation BOOLEAN DEFAULT false,
  department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela de participantes dos eventos
CREATE TABLE IF NOT EXISTS public.event_participants (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'confirmed' CHECK(status IN ('confirmed', 'pending', 'cancelled')),
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  UNIQUE(event_id, member_id)
);

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_events_start_datetime ON events(start_datetime);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_department_id ON events(department_id);
CREATE INDEX IF NOT EXISTS idx_events_is_active ON events(is_active);
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_member_id ON event_participants(member_id);

-- 4. Criar trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_events_updated_at 
  BEFORE UPDATE ON events 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Configurar Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas de segurança
CREATE POLICY "Enable read access for authenticated users" ON events 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON events 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON events 
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON events 
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON event_participants 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON event_participants 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON event_participants 
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON event_participants 
  FOR DELETE USING (auth.role() = 'authenticated');

-- 7. Inserir eventos de exemplo para teste
-- Primeiro, vamos verificar se existe pelo menos um usuário
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Pegar o primeiro usuário disponível
    SELECT id INTO user_uuid FROM auth.users LIMIT 1;
    
    -- Se não houver usuários, criar eventos sem created_by (será NULL)
    IF user_uuid IS NULL THEN
        INSERT INTO events (title, description, event_type, start_datetime, end_datetime, location, is_active) VALUES
        ('Culto Dominical', 'Culto de adoração e pregação da palavra', 'culto', '2025-08-03 10:00:00+00', '2025-08-03 12:00:00+00', 'Templo Principal', true),
        ('Reunião de Oração', 'Reunião semanal de oração e intercessão', 'reuniao', '2025-08-01 19:30:00+00', '2025-08-01 21:00:00+00', 'Sala de Oração', true),
        ('Conferência de Jovens', 'Evento especial para a juventude da igreja', 'evento_especial', '2025-08-10 19:00:00+00', '2025-08-10 22:00:00+00', 'Auditório', true),
        ('Escola Bíblica Dominical', 'Estudo bíblico para todas as idades', 'reuniao', '2025-08-03 09:00:00+00', '2025-08-03 09:45:00+00', 'Salas de Aula', true),
        ('Vigília de Ano Novo', 'Vigília especial de passagem de ano', 'evento_especial', '2025-12-31 22:00:00+00', '2026-01-01 01:00:00+00', 'Templo Principal', true)
        ON CONFLICT DO NOTHING;
    ELSE
        INSERT INTO events (title, description, event_type, start_datetime, end_datetime, location, created_by, is_active) VALUES
        ('Culto Dominical', 'Culto de adoração e pregação da palavra', 'culto', '2025-08-03 10:00:00+00', '2025-08-03 12:00:00+00', 'Templo Principal', user_uuid, true),
        ('Reunião de Oração', 'Reunião semanal de oração e intercessão', 'reuniao', '2025-08-01 19:30:00+00', '2025-08-01 21:00:00+00', 'Sala de Oração', user_uuid, true),
        ('Conferência de Jovens', 'Evento especial para a juventude da igreja', 'evento_especial', '2025-08-10 19:00:00+00', '2025-08-10 22:00:00+00', 'Auditório', user_uuid, true),
        ('Escola Bíblica Dominical', 'Estudo bíblico para todas as idades', 'reuniao', '2025-08-03 09:00:00+00', '2025-08-03 09:45:00+00', 'Salas de Aula', user_uuid, true),
        ('Vigília de Ano Novo', 'Vigília especial de passagem de ano', 'evento_especial', '2025-12-31 22:00:00+00', '2026-01-01 01:00:00+00', 'Templo Principal', user_uuid, true)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- 8. Comentários para documentação
COMMENT ON TABLE events IS 'Eventos da igreja (cultos, reuniões, eventos especiais)';
COMMENT ON TABLE event_participants IS 'Participantes inscritos nos eventos';
COMMENT ON COLUMN events.event_type IS 'Tipo: culto, reuniao, evento_especial';
COMMENT ON COLUMN events.start_datetime IS 'Data e hora de início do evento';
COMMENT ON COLUMN events.end_datetime IS 'Data e hora de fim do evento (opcional)';
COMMENT ON COLUMN events.max_participants IS 'Limite máximo de participantes (opcional)';
COMMENT ON COLUMN events.requires_confirmation IS 'Se requer confirmação de presença';
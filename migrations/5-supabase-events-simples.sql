-- Migration 5: Sistema de Eventos para Supabase (Versão Simples)
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela de eventos
CREATE TABLE IF NOT EXISTS public.events (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK(event_type IN ('culto', 'reuniao', 'evento_especial')),
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE,
  location TEXT,
  max_participants INTEGER,
  requires_confirmation BOOLEAN DEFAULT false,
  department_id INTEGER,
  created_by UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela de participantes dos eventos
CREATE TABLE IF NOT EXISTS public.event_participants (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL,
  member_id INTEGER NOT NULL,
  status TEXT DEFAULT 'confirmed',
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  UNIQUE(event_id, member_id)
);

-- 3. Criar índices básicos
CREATE INDEX IF NOT EXISTS idx_events_start_datetime ON events(start_datetime);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_is_active ON events(is_active);

-- 4. Configurar Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas de segurança básicas
CREATE POLICY "Enable all for authenticated users" ON events 
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON event_participants 
  FOR ALL USING (auth.role() = 'authenticated');

-- 6. Inserir eventos de exemplo (sem foreign keys por enquanto)
INSERT INTO events (title, description, event_type, start_datetime, end_datetime, location, is_active) VALUES
('Culto Dominical', 'Culto de adoração e pregação da palavra', 'culto', '2025-08-03 10:00:00', '2025-08-03 12:00:00', 'Templo Principal', true),
('Reunião de Oração', 'Reunião semanal de oração e intercessão', 'reuniao', '2025-08-01 19:30:00', '2025-08-01 21:00:00', 'Sala de Oração', true),
('Conferência de Jovens', 'Evento especial para a juventude da igreja', 'evento_especial', '2025-08-10 19:00:00', '2025-08-10 22:00:00', 'Auditório', true)
ON CONFLICT DO NOTHING;
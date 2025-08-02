-- Migration 5: Sistema de Eventos (Versão Corrigida)
-- Execute este SQL no Supabase SQL Editor

-- Primeiro, vamos verificar o tipo da coluna id na tabela departments
-- Se der erro, execute apenas a partir da linha "-- Tabela de eventos"

-- Tabela de eventos (sem foreign keys primeiro)
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL CHECK(event_type IN ('culto', 'reuniao', 'evento_especial')),
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ,
    location TEXT,
    max_participants INTEGER,
    requires_confirmation BOOLEAN DEFAULT false,
    department_id INTEGER,
    created_by INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de participantes dos eventos (sem foreign keys primeiro)
CREATE TABLE IF NOT EXISTS event_participants (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL,
    member_id INTEGER NOT NULL,
    status TEXT DEFAULT 'confirmed' CHECK(status IN ('confirmed', 'pending', 'cancelled')),
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    UNIQUE(event_id, member_id)
);

-- Índices básicos
CREATE INDEX IF NOT EXISTS idx_events_start_datetime ON events(start_datetime);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_department_id ON events(department_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_member_id ON event_participants(member_id);

-- Eventos de exemplo
INSERT INTO events (title, description, event_type, start_datetime, end_datetime, location, created_by) VALUES
('Culto Dominical', 'Culto de adoração e pregação da palavra', 'culto', '2025-08-03 10:00:00+00', '2025-08-03 12:00:00+00', 'Templo Principal', 1),
('Reunião de Oração', 'Reunião semanal de oração e intercessão', 'reuniao', '2025-08-01 19:30:00+00', '2025-08-01 21:00:00+00', 'Sala de Oração', 1),
('Conferência de Jovens', 'Evento especial para a juventude da igreja', 'evento_especial', '2025-08-10 19:00:00+00', '2025-08-10 22:00:00+00', 'Auditório', 1),
('Escola Bíblica Dominical', 'Estudo bíblico para todas as idades', 'reuniao', '2025-08-03 09:00:00+00', '2025-08-03 09:45:00+00', 'Salas de Aula', 1)
ON CONFLICT DO NOTHING;
-- Migration 5: Sistema de Eventos (Supabase/PostgreSQL)
-- Criação das tabelas para gerenciamento de eventos da igreja

-- Tabela de eventos
CREATE TABLE IF NOT EXISTS events (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL CHECK(char_length(title) >= 3 AND char_length(title) <= 100),
    description TEXT CHECK(char_length(description) <= 500),
    event_type TEXT NOT NULL CHECK(event_type IN ('culto', 'reuniao', 'evento_especial')),
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ,
    location TEXT CHECK(char_length(location) <= 200),
    max_participants INTEGER CHECK(max_participants > 0),
    requires_confirmation BOOLEAN DEFAULT false,
    department_id BIGINT,
    created_by BIGINT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_events_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    CONSTRAINT fk_events_created_by FOREIGN KEY (created_by) REFERENCES church_users(id) ON DELETE CASCADE
);

-- Tabela de participantes dos eventos
CREATE TABLE IF NOT EXISTS event_participants (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL,
    member_id BIGINT NOT NULL,
    status TEXT DEFAULT 'confirmed' CHECK(status IN ('confirmed', 'pending', 'cancelled')),
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    CONSTRAINT fk_event_participants_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    CONSTRAINT fk_event_participants_member FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    CONSTRAINT unique_event_member UNIQUE(event_id, member_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_events_start_datetime ON events(start_datetime);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_department_id ON events(department_id);
CREATE INDEX IF NOT EXISTS idx_events_is_active ON events(is_active);
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_member_id ON event_participants(member_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir alguns eventos de exemplo para teste
INSERT INTO events (id, title, description, event_type, start_datetime, end_datetime, location, created_by, is_active) VALUES
(1, 'Culto Dominical', 'Culto de adoração e pregação da palavra', 'culto', '2025-08-03 10:00:00+00', '2025-08-03 12:00:00+00', 'Templo Principal', 1, true),
(2, 'Reunião de Oração', 'Reunião semanal de oração e intercessão', 'reuniao', '2025-08-01 19:30:00+00', '2025-08-01 21:00:00+00', 'Sala de Oração', 1, true),
(3, 'Conferência de Jovens', 'Evento especial para a juventude da igreja', 'evento_especial', '2025-08-10 19:00:00+00', '2025-08-10 22:00:00+00', 'Auditório', 1, true),
(4, 'Escola Bíblica Dominical', 'Estudo bíblico para todas as idades', 'reuniao', '2025-08-03 09:00:00+00', '2025-08-03 09:45:00+00', 'Salas de Aula', 1, true),
(5, 'Vigília de Ano Novo', 'Vigília especial de passagem de ano', 'evento_especial', '2025-12-31 22:00:00+00', '2026-01-01 01:00:00+00', 'Templo Principal', 1, true)
ON CONFLICT (id) DO NOTHING;
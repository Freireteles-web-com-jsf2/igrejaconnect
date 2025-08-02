-- Migration 5: Sistema de Eventos
-- Criação das tabelas para gerenciamento de eventos da igreja

-- Tabela de eventos
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL CHECK(length(title) >= 3 AND length(title) <= 100),
    description TEXT CHECK(length(description) <= 500),
    event_type TEXT NOT NULL CHECK(event_type IN ('culto', 'reuniao', 'evento_especial')),
    start_datetime TEXT NOT NULL, -- ISO 8601 format
    end_datetime TEXT, -- ISO 8601 format
    location TEXT CHECK(length(location) <= 200),
    max_participants INTEGER CHECK(max_participants > 0),
    requires_confirmation BOOLEAN DEFAULT 0,
    department_id INTEGER,
    created_by INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES church_users(id) ON DELETE CASCADE
);

-- Tabela de participantes dos eventos
CREATE TABLE IF NOT EXISTS event_participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    member_id INTEGER NOT NULL,
    status TEXT DEFAULT 'confirmed' CHECK(status IN ('confirmed', 'pending', 'cancelled')),
    registered_at TEXT DEFAULT (datetime('now')),
    notes TEXT,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    UNIQUE(event_id, member_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_events_start_datetime ON events(start_datetime);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_department_id ON events(department_id);
CREATE INDEX IF NOT EXISTS idx_events_is_active ON events(is_active);
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_member_id ON event_participants(member_id);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER IF NOT EXISTS update_events_updated_at 
    AFTER UPDATE ON events
    FOR EACH ROW
BEGIN
    UPDATE events SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Inserir alguns eventos de exemplo para teste
INSERT OR IGNORE INTO events (id, title, description, event_type, start_datetime, end_datetime, location, created_by, is_active) VALUES
(1, 'Culto Dominical', 'Culto de adoração e pregação da palavra', 'culto', '2025-08-03 10:00:00', '2025-08-03 12:00:00', 'Templo Principal', 1, 1),
(2, 'Reunião de Oração', 'Reunião semanal de oração e intercessão', 'reuniao', '2025-08-01 19:30:00', '2025-08-01 21:00:00', 'Sala de Oração', 1, 1),
(3, 'Conferência de Jovens', 'Evento especial para a juventude da igreja', 'evento_especial', '2025-08-10 19:00:00', '2025-08-10 22:00:00', 'Auditório', 1, 1),
(4, 'Escola Bíblica Dominical', 'Estudo bíblico para todas as idades', 'reuniao', '2025-08-03 09:00:00', '2025-08-03 09:45:00', 'Salas de Aula', 1, 1),
(5, 'Vigília de Ano Novo', 'Vigília especial de passagem de ano', 'evento_especial', '2025-12-31 22:00:00', '2026-01-01 01:00:00', 'Templo Principal', 1, 1);
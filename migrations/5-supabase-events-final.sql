-- Migration 5: Sistema de Eventos para Supabase (Versão Final)
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela de eventos (sem foreign keys por enquanto)
CREATE TABLE IF NOT EXISTS public.events (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL,
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
  notes TEXT
);

-- 3. Configurar Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas de segurança
CREATE POLICY "Enable all for authenticated users" ON events 
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON event_participants 
  FOR ALL USING (auth.role() = 'authenticated');
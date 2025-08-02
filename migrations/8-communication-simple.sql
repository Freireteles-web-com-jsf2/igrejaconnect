-- Migration 8: Sistema de Comunicação (Versão Simples)
-- Execute este script no SQL Editor do Supabase

-- Criar tabela de avisos básica
CREATE TABLE IF NOT EXISTS public.announcements (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  announcement_type TEXT NOT NULL DEFAULT 'general',
  target_audience TEXT NOT NULL DEFAULT 'all',
  department_id INTEGER,
  priority TEXT DEFAULT 'normal',
  expires_at TIMESTAMP WITH TIME ZONE,
  is_published BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  created_by UUID,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configurar Row Level Security (RLS)
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Criar política de segurança simples
CREATE POLICY "Enable all for authenticated users" ON announcements 
  FOR ALL USING (auth.role() = 'authenticated');
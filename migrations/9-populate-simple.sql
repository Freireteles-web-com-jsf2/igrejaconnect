-- Migration 9: Popular banco com dados iniciais (Versão Simples)
-- Execute este script no SQL Editor do Supabase

-- 1. Inserir membros de exemplo
INSERT INTO members (name, email, phone, birth_date, address, gender, marital_status, is_active, notes) VALUES
('João Silva Santos', 'joao.silva@email.com', '(11) 99999-1111', '1985-03-15', 'Rua das Flores, 123 - Centro', 'masculino', 'casado', true, 'Líder do ministério de louvor'),
('Maria Oliveira Costa', 'maria.oliveira@email.com', '(11) 99999-2222', '1990-07-22', 'Av. Principal, 456 - Jardim', 'feminino', 'solteiro', true, 'Professora da escola dominical'),
('Pedro Almeida Lima', 'pedro.almeida@email.com', '(11) 99999-3333', '1978-11-08', 'Rua da Igreja, 789 - Vila Nova', 'masculino', 'casado', true, 'Diácono da igreja'),
('Ana Carolina Ferreira', 'ana.ferreira@email.com', '(11) 99999-4444', '1995-01-30', 'Rua São João, 321 - Centro', 'feminino', 'solteiro', true, 'Coordenadora de jovens'),
('Carlos Eduardo Souza', 'carlos.souza@email.com', '(11) 99999-5555', '1982-09-12', 'Av. Brasil, 654 - Comercial', 'masculino', 'divorciado', true, 'Tesoureiro da igreja')
ON CONFLICT DO NOTHING;

-- 2. Inserir departamentos com líderes
INSERT INTO departments (name, category, leaders, meeting_datetime, is_active, notes) VALUES
('Ministério de Louvor e Adoração', 'Louvor e Adoração', ARRAY[1], '2025-08-05 19:30:00', true, 'Ensaios todas as terças-feiras'),
('Escola Bíblica Dominical', 'Educação Cristã', ARRAY[2], '2025-08-03 09:00:00', true, 'Aulas todos os domingos'),
('Ministério de Jovens', 'Juventude', ARRAY[4], '2025-08-02 19:00:00', true, 'Reuniões semanais de jovens'),
('Diretoria da Igreja', 'Administração', ARRAY[3, 5], '2025-08-01 20:00:00', true, 'Reunião mensal da diretoria')
ON CONFLICT DO NOTHING;

-- 3. Inserir transações financeiras
INSERT INTO financial_transactions (type, amount, description, category, date) VALUES
('receita', 1500.00, 'Dízimos - Primeira semana de agosto', 'Dízimos', '2025-08-01'),
('receita', 800.00, 'Ofertas do culto dominical', 'Ofertas', '2025-08-01'),
('receita', 2200.00, 'Dízimos - Segunda semana de agosto', 'Dízimos', '2025-08-08'),
('receita', 500.00, 'Doação especial para reforma', 'Doações', '2025-08-05'),
('despesa', 800.00, 'Conta de energia elétrica', 'Energia Elétrica', '2025-08-02'),
('despesa', 300.00, 'Conta de água', 'Água', '2025-08-03'),
('despesa', 1200.00, 'Aluguel do templo', 'Aluguel', '2025-08-01')
ON CONFLICT DO NOTHING;

-- 4. Inserir eventos básicos
INSERT INTO events (title, description, event_type, start_datetime, end_datetime, location, is_active) VALUES
('Culto Dominical Matutino', 'Culto de adoração e pregação da palavra', 'culto', '2025-08-03 10:00:00', '2025-08-03 12:00:00', 'Templo Principal', true),
('Reunião de Oração', 'Reunião semanal de oração', 'reuniao', '2025-08-06 19:30:00', '2025-08-06 21:00:00', 'Sala de Oração', true),
('Conferência de Jovens', 'Evento especial para jovens', 'evento_especial', '2025-08-15 19:00:00', '2025-08-15 22:00:00', 'Auditório', true)
ON CONFLICT DO NOTHING;

-- 5. Atualizar ou inserir configurações da igreja
INSERT INTO church_settings (
  church_name, 
  church_address, 
  church_phone, 
  church_email,
  primary_color,
  secondary_color
) VALUES (
  'Igreja Batista Central',
  'Rua da Igreja, 123 - Centro - São Paulo/SP',
  '(11) 3333-4444',
  'contato@igreja.com.br',
  '#1E40AF',
  '#059669'
) ON CONFLICT DO NOTHING;

-- 6. Inserir avisos básicos
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
  'Sistema de gestão da igreja totalmente funcional com dados reais.',
  'general',
  'all',
  'high',
  true,
  true,
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
  NOW()
)
ON CONFLICT DO NOTHING;
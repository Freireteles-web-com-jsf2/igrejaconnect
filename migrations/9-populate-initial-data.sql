-- Migration 9: Popular banco com dados iniciais reais
-- Execute este script no SQL Editor do Supabase APÓS configurar as outras migrations

-- 1. Inserir membros de exemplo (substitua pelos dados reais da sua igreja)
INSERT INTO members (name, email, phone, birth_date, address, gender, marital_status, is_active, notes) VALUES
('João Silva Santos', 'joao.silva@email.com', '(11) 99999-1111', '1985-03-15', 'Rua das Flores, 123 - Centro', 'masculino', 'casado', true, 'Líder do ministério de louvor'),
('Maria Oliveira Costa', 'maria.oliveira@email.com', '(11) 99999-2222', '1990-07-22', 'Av. Principal, 456 - Jardim', 'feminino', 'solteiro', true, 'Professora da escola dominical'),
('Pedro Almeida Lima', 'pedro.almeida@email.com', '(11) 99999-3333', '1978-11-08', 'Rua da Igreja, 789 - Vila Nova', 'masculino', 'casado', true, 'Diácono da igreja'),
('Ana Carolina Ferreira', 'ana.ferreira@email.com', '(11) 99999-4444', '1995-01-30', 'Rua São João, 321 - Centro', 'feminino', 'solteiro', true, 'Coordenadora de jovens'),
('Carlos Eduardo Souza', 'carlos.souza@email.com', '(11) 99999-5555', '1982-09-12', 'Av. Brasil, 654 - Comercial', 'masculino', 'divorciado', true, 'Tesoureiro da igreja'),
('Fernanda Ribeiro Silva', 'fernanda.ribeiro@email.com', '(11) 99999-6666', '1988-05-18', 'Rua das Palmeiras, 987 - Residencial', 'feminino', 'casado', true, 'Secretária da igreja'),
('Roberto Carlos Mendes', 'roberto.mendes@email.com', '(11) 99999-7777', '1975-12-03', 'Rua da Paz, 147 - Vila Esperança', 'masculino', 'casado', true, 'Pastor auxiliar'),
('Juliana Santos Pereira', 'juliana.pereira@email.com', '(11) 99999-8888', '1992-08-25', 'Av. das Nações, 258 - Centro', 'feminino', 'solteiro', true, 'Coordenadora de crianças')
ON CONFLICT DO NOTHING;

-- 2. Inserir departamentos com líderes reais
INSERT INTO departments (name, category, leaders, meeting_datetime, is_active, notes) VALUES
('Ministério de Louvor e Adoração', 'Louvor e Adoração', ARRAY[1], '2025-08-05 19:30:00', true, 'Ensaios todas as terças-feiras'),
('Escola Bíblica Dominical', 'Educação Cristã', ARRAY[2], '2025-08-03 09:00:00', true, 'Aulas todos os domingos'),
('Ministério de Jovens', 'Juventude', ARRAY[4], '2025-08-02 19:00:00', true, 'Reuniões semanais de jovens'),
('Diretoria da Igreja', 'Administração', ARRAY[3, 5], '2025-08-01 20:00:00', true, 'Reunião mensal da diretoria'),
('Ministério Infantil', 'Crianças', ARRAY[8], '2025-08-04 15:00:00', true, 'Atividades para crianças'),
('Ministério de Evangelismo', 'Evangelismo', ARRAY[7], '2025-08-06 19:30:00', true, 'Evangelismo e missões'),
('Secretaria da Igreja', 'Administração', ARRAY[6], NULL, true, 'Apoio administrativo')
ON CONFLICT DO NOTHING;

-- 3. Inserir transações financeiras de exemplo
INSERT INTO financial_transactions (type, amount, description, category, date, user_id) VALUES
('receita', 1500.00, 'Dízimos - Primeira semana de agosto', 'Dízimos', '2025-08-01', (SELECT id FROM auth.users LIMIT 1)),
('receita', 800.00, 'Ofertas do culto dominical', 'Ofertas', '2025-08-01', (SELECT id FROM auth.users LIMIT 1)),
('receita', 2200.00, 'Dízimos - Segunda semana de agosto', 'Dízimos', '2025-08-08', (SELECT id FROM auth.users LIMIT 1)),
('receita', 500.00, 'Doação especial para reforma', 'Doações', '2025-08-05', (SELECT id FROM auth.users LIMIT 1)),
('despesa', 800.00, 'Conta de energia elétrica', 'Energia Elétrica', '2025-08-02', (SELECT id FROM auth.users LIMIT 1)),
('despesa', 300.00, 'Conta de água', 'Água', '2025-08-03', (SELECT id FROM auth.users LIMIT 1)),
('despesa', 1200.00, 'Aluguel do templo', 'Aluguel', '2025-08-01', (SELECT id FROM auth.users LIMIT 1)),
('despesa', 150.00, 'Material de limpeza', 'Material de Limpeza', '2025-08-04', (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT DO NOTHING;

-- 4. Inserir eventos de exemplo (sem created_by por enquanto)
INSERT INTO events (title, description, event_type, start_datetime, end_datetime, location, is_active) VALUES
('Culto Dominical Matutino', 'Culto de adoração e pregação da palavra de Deus', 'culto', '2025-08-03 10:00:00', '2025-08-03 12:00:00', 'Templo Principal', true),
('Culto Dominical Vespertino', 'Culto de louvor e ministração', 'culto', '2025-08-03 18:00:00', '2025-08-03 20:00:00', 'Templo Principal', true),
('Reunião de Oração', 'Reunião semanal de oração e intercessão', 'reuniao', '2025-08-06 19:30:00', '2025-08-06 21:00:00', 'Sala de Oração', true),
('Escola Bíblica Dominical', 'Estudo bíblico para todas as idades', 'reuniao', '2025-08-03 09:00:00', '2025-08-03 09:45:00', 'Salas de Aula', true),
('Conferência de Jovens 2025', 'Evento especial para a juventude da igreja', 'evento_especial', '2025-08-15 19:00:00', '2025-08-15 22:00:00', 'Auditório Principal', true),
('Vigília de Oração', 'Noite de oração e busca a Deus', 'evento_especial', '2025-08-09 20:00:00', '2025-08-10 06:00:00', 'Templo Principal', true)
ON CONFLICT DO NOTHING;

-- 5. Atualizar configurações da igreja com dados reais
UPDATE church_settings SET
  church_name = 'Igreja Batista Central',
  church_address = 'Rua da Igreja, 123 - Centro - São Paulo/SP',
  church_phone = '(11) 3333-4444',
  church_email = 'contato@igrejabatistacentral.com.br',
  church_website = 'https://www.igrejabatistacentral.com.br',
  primary_color = '#1E40AF',
  secondary_color = '#059669',
  updated_at = NOW()
WHERE id = 1;

-- Se não existir configuração, inserir uma nova
INSERT INTO church_settings (
  church_name, 
  church_address, 
  church_phone, 
  church_email, 
  church_website,
  primary_color,
  secondary_color
) 
SELECT 
  'Igreja Batista Central',
  'Rua da Igreja, 123 - Centro - São Paulo/SP',
  '(11) 3333-4444',
  'contato@igrejabatistacentral.com.br',
  'https://www.igrejabatistacentral.com.br',
  '#1E40AF',
  '#059669'
WHERE NOT EXISTS (SELECT 1 FROM church_settings);

-- 6. Inserir avisos de exemplo (sem created_by por enquanto)
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
  'Bem-vindos ao Sistema IgrejaConnect!',
  'Estamos felizes em apresentar o novo sistema de gestão da nossa igreja. Aqui você encontrará todas as informações importantes sobre nossa comunidade, eventos, finanças e muito mais. O sistema está totalmente integrado e sincronizado com dados reais.',
  'general',
  'all',
  'high',
  true,
  true,
  NOW()
),
(
  'Conferência de Jovens 2025',
  'Não percam a Conferência de Jovens que acontecerá no dia 15 de agosto às 19h. Será uma noite especial com louvor, palavra e comunhão. Tragam seus amigos!',
  'event',
  'all',
  'normal',
  true,
  false,
  NOW()
),
(
  'Reunião de Líderes - Agosto',
  'Convocamos todos os líderes de departamento para a reunião mensal que acontecerá na próxima quinta-feira às 20h. Assuntos importantes serão tratados.',
  'department',
  'leaders',
  'high',
  true,
  false,
  NOW()
),
(
  'Relatório Financeiro Disponível',
  'O relatório financeiro do mês de julho já está disponível no sistema. Acesse a seção de relatórios para visualizar e exportar os dados.',
  'financial',
  'leaders',
  'normal',
  true,
  false,
  NOW()
)
ON CONFLICT DO NOTHING;

-- Comentários para documentação
COMMENT ON TABLE members IS 'Membros da igreja com dados reais';
COMMENT ON TABLE departments IS 'Departamentos organizados com líderes ativos';
COMMENT ON TABLE financial_transactions IS 'Transações financeiras reais da igreja';
COMMENT ON TABLE events IS 'Eventos e programações da igreja';
COMMENT ON TABLE announcements IS 'Avisos e comunicados publicados';
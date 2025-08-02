
-- Migration 3: Configurar usuário administrador para Supabase
-- Este arquivo é executado automaticamente quando o usuário faz login pela primeira vez
-- através da função handle_new_user() no Supabase

-- Nota: No Supabase, os usuários são criados automaticamente na tabela auth.users
-- e sincronizados para church_users através do trigger on_auth_user_created

-- Função para garantir que o usuário admin tenha as permissões corretas
CREATE OR REPLACE FUNCTION ensure_admin_permissions()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o email for do administrador, garantir que tenha o papel correto
  IF NEW.email = 'lucianofreireteles@gmail.com' THEN
    NEW.role = 'Administrador';
    NEW.name = COALESCE(NEW.name, 'Luciano Teles Freire');
    NEW.is_active = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para garantir permissões de admin no insert/update
DROP TRIGGER IF EXISTS ensure_admin_permissions_trigger ON church_users;
CREATE TRIGGER ensure_admin_permissions_trigger
  BEFORE INSERT OR UPDATE ON church_users
  FOR EACH ROW
  EXECUTE FUNCTION ensure_admin_permissions();

-- Atualizar usuário existente se já estiver na tabela
UPDATE church_users 
SET 
  role = 'Administrador', 
  name = 'Luciano Teles Freire',
  is_active = true,
  updated_at = NOW()
WHERE email = 'lucianofreireteles@gmail.com';

-- Inserir dados de exemplo para demonstração (opcional)
-- Estes dados serão criados apenas se não existirem

-- Inserir alguns membros de exemplo
INSERT INTO members (name, email, phone, is_active, notes) VALUES
('Maria Silva', 'maria.silva@email.com', '(11) 99999-1111', true, 'Membro ativo da igreja'),
('João Santos', 'joao.santos@email.com', '(11) 99999-2222', true, 'Líder do ministério de louvor'),
('Ana Costa', 'ana.costa@email.com', '(11) 99999-3333', true, 'Professora da escola dominical')
ON CONFLICT (email) DO NOTHING;

-- Inserir alguns departamentos de exemplo
INSERT INTO departments (name, category, is_active, notes) VALUES
('Ministério de Louvor', 'Música', true, 'Responsável pela música nos cultos'),
('Escola Dominical', 'Educação', true, 'Ensino bíblico para todas as idades'),
('Ministério Infantil', 'Crianças', true, 'Cuidado e ensino das crianças'),
('Grupo de Jovens', 'Juventude', true, 'Atividades para jovens da igreja')
ON CONFLICT (name) DO NOTHING;

-- Inserir algumas transações financeiras de exemplo
INSERT INTO financial_transactions (type, amount, description, category, date) VALUES
('receita', 1500.00, 'Dízimos e ofertas - Domingo', 'Dízimos', CURRENT_DATE - INTERVAL '7 days'),
('receita', 800.00, 'Oferta especial - Missões', 'Ofertas', CURRENT_DATE - INTERVAL '5 days'),
('despesa', 300.00, 'Conta de luz', 'Utilidades', CURRENT_DATE - INTERVAL '3 days'),
('despesa', 150.00, 'Material de limpeza', 'Manutenção', CURRENT_DATE - INTERVAL '2 days'),
('receita', 2000.00, 'Dízimos e ofertas - Domingo', 'Dízimos', CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- Inserir algumas notificações de exemplo
INSERT INTO notifications (title, message, type) VALUES
('Bem-vindo ao IgrejaConnect!', 'Sistema de gestão da igreja configurado com sucesso.', 'info'),
('Culto de Domingo', 'Lembrete: Culto de domingo às 19h. Não falte!', 'info'),
('Reunião de Líderes', 'Reunião de líderes marcada para quinta-feira às 20h.', 'warning')
ON CONFLICT DO NOTHING;

-- Comentários sobre a migração
COMMENT ON FUNCTION ensure_admin_permissions() IS 'Garante que lucianofreireteles@gmail.com sempre tenha papel de Administrador';

-- Log da migração
DO $$
BEGIN
  RAISE NOTICE 'Migration 3 executada com sucesso - Configurações de administrador e dados de exemplo criados';
END $$;

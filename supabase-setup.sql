-- Configuração do banco de dados Supabase para IgrejaConnect
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela de usuários da igreja (estende auth.users)
CREATE TABLE IF NOT EXISTS public.church_users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'Membro',
  permissions TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  phone TEXT,
  birth_date DATE,
  address TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela de membros
CREATE TABLE IF NOT EXISTS public.members (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  birth_date DATE,
  address TEXT,
  baptism_date DATE,
  gender TEXT CHECK (gender IN ('masculino', 'feminino', 'outro')),
  marital_status TEXT CHECK (marital_status IN ('solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel')),
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela de departamentos
CREATE TABLE IF NOT EXISTS public.departments (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  leaders INTEGER[] DEFAULT '{}',
  meeting_datetime TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela de transações financeiras
CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('receita', 'despesa')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  date DATE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Criar tabela de notificações
CREATE TABLE IF NOT EXISTS public.notifications (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Criar tabela de permissões
CREATE TABLE IF NOT EXISTS public.permissions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Criar tabela de papéis personalizados
CREATE TABLE IF NOT EXISTS public.custom_roles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_system_role BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Criar tabela de relacionamento entre papéis e permissões
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id SERIAL PRIMARY KEY,
  role_name TEXT NOT NULL,
  permission_id INTEGER REFERENCES permissions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Inserir permissões padrão
INSERT INTO permissions (name, description, module, action) VALUES
-- Dashboard
('dashboard.view', 'Visualizar dashboard', 'dashboard', 'view'),

-- Membros
('members.view', 'Visualizar membros', 'members', 'view'),
('members.create', 'Criar novo membro', 'members', 'create'),
('members.edit', 'Editar membro', 'members', 'edit'),
('members.delete', 'Excluir membro', 'members', 'delete'),
('members.export', 'Exportar dados de membros', 'members', 'export'),

-- Departamentos
('departments.view', 'Visualizar departamentos', 'departments', 'view'),
('departments.create', 'Criar departamentos', 'departments', 'create'),
('departments.edit', 'Editar departamentos', 'departments', 'edit'),
('departments.delete', 'Excluir departamentos', 'departments', 'delete'),

-- Financeiro
('financial.view', 'Visualizar dados financeiros', 'financial', 'view'),
('financial.create', 'Criar transação financeira', 'financial', 'create'),
('financial.edit', 'Editar transação financeira', 'financial', 'edit'),
('financial.delete', 'Excluir transação financeira', 'financial', 'delete'),
('financial.reports', 'Gerar relatórios financeiros', 'financial', 'reports'),

-- Usuários e Permissões
('users.view', 'Visualizar usuários', 'users', 'view'),
('users.edit', 'Editar usuários', 'users', 'edit'),
('users.permissions', 'Gerenciar permissões', 'users', 'permissions'),

-- Notificações
('notifications.view', 'Visualizar notificações', 'notifications', 'view'),
('notifications.create', 'Criar notificação', 'notifications', 'create'),
('notifications.edit', 'Editar notificação', 'notifications', 'edit'),

-- Configurações
('settings.view', 'Visualizar configurações', 'settings', 'view'),
('settings.edit', 'Editar configurações', 'settings', 'edit')
ON CONFLICT (name) DO NOTHING;

-- 10. Inserir papéis padrão
INSERT INTO custom_roles (name, description, is_system_role) VALUES
('Administrador', 'Acesso total ao sistema', true),
('Pastor', 'Acesso a membros e notificações, visualização financeira', true),
('Líder', 'Acesso a membros e criação de notificações', true),
('Tesoureiro', 'Acesso total ao módulo financeiro e visualização de membros', true),
('Voluntário', 'Acesso básico a membros e dashboard', true),
('Membro', 'Acesso apenas ao dashboard', true)
ON CONFLICT (name) DO NOTHING;

-- 11. Definir permissões para cada papel
-- Administrador (todas as permissões)
INSERT INTO role_permissions (role_name, permission_id) 
SELECT 'Administrador', id FROM permissions
ON CONFLICT DO NOTHING;

-- Pastor
INSERT INTO role_permissions (role_name, permission_id) 
SELECT 'Pastor', id FROM permissions WHERE name IN (
  'dashboard.view', 'members.view', 'members.create', 'members.edit', 'members.export',
  'departments.view', 'departments.create', 'departments.edit',
  'financial.view', 'financial.reports', 'notifications.view', 'notifications.create', 'notifications.edit'
)
ON CONFLICT DO NOTHING;

-- Líder
INSERT INTO role_permissions (role_name, permission_id) 
SELECT 'Líder', id FROM permissions WHERE name IN (
  'dashboard.view', 'members.view', 'members.create', 'members.edit',
  'departments.view', 'departments.create', 'departments.edit',
  'notifications.view', 'notifications.create'
)
ON CONFLICT DO NOTHING;

-- Tesoureiro
INSERT INTO role_permissions (role_name, permission_id) 
SELECT 'Tesoureiro', id FROM permissions WHERE name IN (
  'dashboard.view', 'members.view', 'financial.view', 'financial.create', 
  'financial.edit', 'financial.delete', 'financial.reports'
)
ON CONFLICT DO NOTHING;

-- Voluntário
INSERT INTO role_permissions (role_name, permission_id) 
SELECT 'Voluntário', id FROM permissions WHERE name IN (
  'dashboard.view', 'members.view', 'departments.view', 'notifications.view'
)
ON CONFLICT DO NOTHING;

-- Membro
INSERT INTO role_permissions (role_name, permission_id) 
SELECT 'Membro', id FROM permissions WHERE name IN (
  'dashboard.view', 'notifications.view'
)
ON CONFLICT DO NOTHING;

-- 12. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 13. Criar triggers para atualizar updated_at
CREATE TRIGGER update_church_users_updated_at BEFORE UPDATE ON church_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financial_transactions_updated_at BEFORE UPDATE ON financial_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 14. Configurar Row Level Security (RLS)
ALTER TABLE church_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 15. Criar políticas de segurança

-- Política para church_users: usuários podem ver e editar apenas seus próprios dados
CREATE POLICY "Users can view own profile" ON church_users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON church_users FOR UPDATE USING (auth.uid() = id);

-- Política para inserir novos usuários (quando fazem primeiro login)
CREATE POLICY "Enable insert for authenticated users only" ON church_users FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para outras tabelas: apenas usuários autenticados podem acessar
CREATE POLICY "Enable read access for authenticated users" ON members FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON members FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON members FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON members FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON departments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON departments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON departments FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON departments FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON financial_transactions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON financial_transactions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON financial_transactions FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON financial_transactions FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON notifications FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON notifications FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON notifications FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para tabelas de sistema (somente leitura para usuários autenticados)
CREATE POLICY "Enable read access for authenticated users" ON permissions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON custom_roles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON role_permissions FOR SELECT USING (auth.role() = 'authenticated');

-- 16. Criar função para sincronizar usuário após login
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.church_users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 17. Criar trigger para sincronizar novos usuários
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 18. Configurar Google OAuth (execute no painel do Supabase)
-- Vá para Authentication > Settings > Auth Providers
-- Ative Google e configure:
-- - Client ID: (obtenha do Google Cloud Console)
-- - Client Secret: (obtenha do Google Cloud Console)
-- - Redirect URL: https://pskaimoanrxcsjeaalrz.supabase.co/auth/v1/callback

COMMENT ON TABLE church_users IS 'Usuários da igreja com dados estendidos';
COMMENT ON TABLE members IS 'Membros da igreja';
COMMENT ON TABLE departments IS 'Departamentos e ministérios da igreja';
COMMENT ON TABLE financial_transactions IS 'Transações financeiras da igreja';
COMMENT ON TABLE notifications IS 'Notificações do sistema';
COMMENT ON TABLE permissions IS 'Permissões disponíveis no sistema';
COMMENT ON TABLE custom_roles IS 'Papéis personalizados';
COMMENT ON TABLE role_permissions IS 'Relacionamento entre papéis e permissões';
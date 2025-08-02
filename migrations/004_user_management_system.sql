-- Migração 004: Sistema de Gestão de Usuários e Permissões
-- Data: Janeiro 2025
-- Descrição: Implementa o sistema completo de gestão de usuários e permissões

-- 1. Verificar e criar tabela de usuários da igreja se não existir
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

-- 2. Verificar e criar tabela de permissões se não existir
CREATE TABLE IF NOT EXISTS public.permissions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Verificar e criar tabela de papéis personalizados se não existir
CREATE TABLE IF NOT EXISTS public.custom_roles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_system_role BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Verificar e criar tabela de relacionamento entre papéis e permissões se não existir
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id SERIAL PRIMARY KEY,
  role_name TEXT NOT NULL,
  permission_id INTEGER REFERENCES permissions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role_name, permission_id)
);

-- 5. Inserir ou atualizar permissões padrão
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

-- Eventos
('events.view', 'Visualizar eventos', 'events', 'view'),
('events.create', 'Criar eventos', 'events', 'create'),
('events.edit', 'Editar eventos', 'events', 'edit'),
('events.delete', 'Excluir eventos', 'events', 'delete'),

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
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  module = EXCLUDED.module,
  action = EXCLUDED.action,
  updated_at = NOW();

-- 6. Inserir ou atualizar papéis padrão
INSERT INTO custom_roles (name, description, is_system_role) VALUES
('Administrador', 'Acesso total ao sistema', true),
('Pastor', 'Acesso a membros e notificações, visualização financeira', true),
('Líder', 'Acesso a membros e criação de notificações', true),
('Tesoureiro', 'Acesso total ao módulo financeiro e visualização de membros', true),
('Voluntário', 'Acesso básico a membros e dashboard', true),
('Membro', 'Acesso apenas ao dashboard', true)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  updated_at = NOW();

-- 7. Limpar relacionamentos existentes para recriar
DELETE FROM role_permissions;

-- 8. Definir permissões para cada papel
-- Administrador (todas as permissões)
INSERT INTO role_permissions (role_name, permission_id) 
SELECT 'Administrador', id FROM permissions;

-- Pastor
INSERT INTO role_permissions (role_name, permission_id) 
SELECT 'Pastor', id FROM permissions WHERE name IN (
  'dashboard.view', 'members.view', 'members.create', 'members.edit', 'members.export',
  'departments.view', 'departments.create', 'departments.edit',
  'events.view', 'events.create', 'events.edit',
  'financial.view', 'financial.reports', 
  'notifications.view', 'notifications.create', 'notifications.edit'
);

-- Líder
INSERT INTO role_permissions (role_name, permission_id) 
SELECT 'Líder', id FROM permissions WHERE name IN (
  'dashboard.view', 'members.view', 'members.create', 'members.edit',
  'departments.view', 'departments.create', 'departments.edit',
  'events.view', 'events.create', 'events.edit',
  'notifications.view', 'notifications.create'
);

-- Tesoureiro
INSERT INTO role_permissions (role_name, permission_id) 
SELECT 'Tesoureiro', id FROM permissions WHERE name IN (
  'dashboard.view', 'members.view', 
  'events.view',
  'financial.view', 'financial.create', 'financial.edit', 'financial.delete', 'financial.reports'
);

-- Voluntário
INSERT INTO role_permissions (role_name, permission_id) 
SELECT 'Voluntário', id FROM permissions WHERE name IN (
  'dashboard.view', 'members.view', 'departments.view', 'events.view', 'notifications.view'
);

-- Membro
INSERT INTO role_permissions (role_name, permission_id) 
SELECT 'Membro', id FROM permissions WHERE name IN (
  'dashboard.view', 'events.view', 'notifications.view'
);

-- 9. Criar função para atualizar updated_at automaticamente (se não existir)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Criar triggers para atualizar updated_at (se não existirem)
DROP TRIGGER IF EXISTS update_church_users_updated_at ON church_users;
CREATE TRIGGER update_church_users_updated_at 
  BEFORE UPDATE ON church_users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_permissions_updated_at ON permissions;
CREATE TRIGGER update_permissions_updated_at 
  BEFORE UPDATE ON permissions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_custom_roles_updated_at ON custom_roles;
CREATE TRIGGER update_custom_roles_updated_at 
  BEFORE UPDATE ON custom_roles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. Configurar Row Level Security (RLS)
ALTER TABLE church_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- 12. Remover políticas existentes se existirem
DROP POLICY IF EXISTS "Users can view own profile" ON church_users;
DROP POLICY IF EXISTS "Users can update own profile" ON church_users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON church_users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON permissions;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON custom_roles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON role_permissions;

-- 13. Criar políticas de segurança
-- Política para church_users: usuários podem ver e editar apenas seus próprios dados
CREATE POLICY "Users can view own profile" ON church_users 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON church_users 
  FOR UPDATE USING (auth.uid() = id);

-- Política para inserir novos usuários (quando fazem primeiro login)
CREATE POLICY "Enable insert for authenticated users only" ON church_users 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para tabelas de sistema (somente leitura para usuários autenticados)
CREATE POLICY "Enable read access for authenticated users" ON permissions 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON custom_roles 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON role_permissions 
  FOR SELECT USING (auth.role() = 'authenticated');

-- 14. Criar função para sincronizar usuário após login (se não existir)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.church_users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, church_users.name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, church_users.avatar_url),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. Criar trigger para sincronizar novos usuários (se não existir)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 16. Atualizar usuários existentes com permissões baseadas em seus papéis
UPDATE church_users 
SET permissions = (
  SELECT ARRAY_AGG(p.name)
  FROM role_permissions rp
  JOIN permissions p ON rp.permission_id = p.id
  WHERE rp.role_name = church_users.role
)
WHERE permissions IS NULL OR array_length(permissions, 1) IS NULL;

-- 17. Garantir que o usuário administrador principal tenha todas as permissões
UPDATE church_users 
SET 
  role = 'Administrador',
  permissions = (SELECT ARRAY_AGG(name) FROM permissions),
  updated_at = NOW()
WHERE email = 'lucianofreireteles@gmail.com';

-- 18. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_church_users_email ON church_users(email);
CREATE INDEX IF NOT EXISTS idx_church_users_role ON church_users(role);
CREATE INDEX IF NOT EXISTS idx_church_users_is_active ON church_users(is_active);
CREATE INDEX IF NOT EXISTS idx_permissions_module ON permissions(module);
CREATE INDEX IF NOT EXISTS idx_permissions_name ON permissions(name);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_name ON role_permissions(role_name);

-- 19. Adicionar comentários para documentação
COMMENT ON TABLE church_users IS 'Usuários da igreja com dados estendidos e permissões';
COMMENT ON TABLE permissions IS 'Permissões disponíveis no sistema';
COMMENT ON TABLE custom_roles IS 'Papéis personalizados do sistema';
COMMENT ON TABLE role_permissions IS 'Relacionamento entre papéis e permissões';

COMMENT ON COLUMN church_users.role IS 'Papel principal do usuário no sistema';
COMMENT ON COLUMN church_users.permissions IS 'Array de permissões específicas do usuário';
COMMENT ON COLUMN church_users.is_active IS 'Se o usuário pode acessar o sistema';

COMMENT ON COLUMN permissions.name IS 'Nome único da permissão (formato: modulo.acao)';
COMMENT ON COLUMN permissions.module IS 'Módulo do sistema ao qual a permissão pertence';
COMMENT ON COLUMN permissions.action IS 'Ação específica que a permissão permite';

-- 20. Verificar integridade dos dados
DO $$
DECLARE
    user_count INTEGER;
    permission_count INTEGER;
    role_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM church_users;
    SELECT COUNT(*) INTO permission_count FROM permissions;
    SELECT COUNT(*) INTO role_count FROM custom_roles;
    
    RAISE NOTICE 'Migração 004 concluída com sucesso!';
    RAISE NOTICE 'Usuários: %, Permissões: %, Papéis: %', user_count, permission_count, role_count;
END $$;
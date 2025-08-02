
-- Tabela de permissões disponíveis no sistema
CREATE TABLE permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de perfis personalizados
CREATE TABLE custom_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_system_role BOOLEAN DEFAULT false,
  created_by TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de relacionamento entre perfis e permissões
CREATE TABLE role_permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role_name TEXT NOT NULL,
  permission_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (permission_id) REFERENCES permissions(id)
);

-- Inserir permissões padrão do sistema
INSERT INTO permissions (name, description, module, action) VALUES
-- Dashboard
('dashboard.view', 'Visualizar dashboard', 'dashboard', 'view'),

-- Membros
('members.view', 'Visualizar membros', 'members', 'view'),
('members.create', 'Criar novo membro', 'members', 'create'),
('members.edit', 'Editar membro', 'members', 'edit'),
('members.delete', 'Excluir membro', 'members', 'delete'),
('members.export', 'Exportar dados de membros', 'members', 'export'),

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
('settings.edit', 'Editar configurações', 'settings', 'edit');

-- Inserir perfis padrão
INSERT INTO custom_roles (name, description, is_system_role) VALUES
('Administrador', 'Acesso total ao sistema', true),
('Pastor', 'Acesso a membros e notificações, visualização financeira', true),
('Líder', 'Acesso a membros e criação de notificações', true),
('Tesoureiro', 'Acesso total ao módulo financeiro e visualização de membros', true),
('Voluntário', 'Acesso básico a membros e dashboard', true),
('Membro', 'Acesso apenas ao dashboard', true);

-- Definir permissões para Administrador (todas)
INSERT INTO role_permissions (role_name, permission_id) 
SELECT 'Administrador', id FROM permissions;

-- Definir permissões para Pastor
INSERT INTO role_permissions (role_name, permission_id) 
SELECT 'Pastor', id FROM permissions WHERE name IN (
  'dashboard.view', 'members.view', 'members.create', 'members.edit', 'members.export',
  'financial.view', 'financial.reports', 'notifications.view', 'notifications.create', 'notifications.edit'
);

-- Definir permissões para Líder
INSERT INTO role_permissions (role_name, permission_id) 
SELECT 'Líder', id FROM permissions WHERE name IN (
  'dashboard.view', 'members.view', 'members.create', 'members.edit',
  'notifications.view', 'notifications.create'
);

-- Definir permissões para Tesoureiro
INSERT INTO role_permissions (role_name, permission_id) 
SELECT 'Tesoureiro', id FROM permissions WHERE name IN (
  'dashboard.view', 'members.view', 'financial.view', 'financial.create', 
  'financial.edit', 'financial.delete', 'financial.reports'
);

-- Definir permissões para Voluntário
INSERT INTO role_permissions (role_name, permission_id) 
SELECT 'Voluntário', id FROM permissions WHERE name IN (
  'dashboard.view', 'members.view', 'notifications.view'
);

-- Definir permissões para Membro
INSERT INTO role_permissions (role_name, permission_id) 
SELECT 'Membro', id FROM permissions WHERE name IN (
  'dashboard.view', 'notifications.view'
);

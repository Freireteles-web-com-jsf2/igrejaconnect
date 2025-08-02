
CREATE TABLE departments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  leaders TEXT, -- JSON array of member IDs (SQLite doesn't support arrays)
  meeting_datetime DATETIME,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add departments permissions
INSERT INTO permissions (name, description, module, action) VALUES
('departments.view', 'Visualizar departamentos', 'departments', 'view'),
('departments.create', 'Criar departamentos', 'departments', 'create'),
('departments.edit', 'Editar departamentos', 'departments', 'edit'),
('departments.delete', 'Excluir departamentos', 'departments', 'delete');

-- Add permissions to roles
INSERT INTO role_permissions (role_name, permission_id) VALUES
('Administrador', (SELECT id FROM permissions WHERE name = 'departments.view')),
('Administrador', (SELECT id FROM permissions WHERE name = 'departments.create')),
('Administrador', (SELECT id FROM permissions WHERE name = 'departments.edit')),
('Administrador', (SELECT id FROM permissions WHERE name = 'departments.delete')),
('Pastor', (SELECT id FROM permissions WHERE name = 'departments.view')),
('Pastor', (SELECT id FROM permissions WHERE name = 'departments.create')),
('Pastor', (SELECT id FROM permissions WHERE name = 'departments.edit')),
('Líder', (SELECT id FROM permissions WHERE name = 'departments.view')),
('Líder', (SELECT id FROM permissions WHERE name = 'departments.create')),
('Líder', (SELECT id FROM permissions WHERE name = 'departments.edit'));


-- Remove role permissions
DELETE FROM role_permissions WHERE permission_id IN (
  SELECT id FROM permissions WHERE module = 'departments'
);

-- Remove permissions
DELETE FROM permissions WHERE module = 'departments';

-- Drop table
DROP TABLE departments;

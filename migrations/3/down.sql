
-- Reverter para membro
UPDATE church_users 
SET role = 'Membro' 
WHERE email = 'lucianofreireteles@gmail.com';

-- Remover registro temporário se foi criado
DELETE FROM church_users 
WHERE email = 'lucianofreireteles@gmail.com' 
AND mocha_user_id = 'temp_admin_luciano';

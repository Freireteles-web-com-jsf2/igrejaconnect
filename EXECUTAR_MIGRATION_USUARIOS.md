# Como Executar a Migração do Sistema de Usuários

## Pré-requisitos

1. Acesso ao painel do Supabase
2. Projeto IgrejaConnect configurado
3. Permissões de administrador no banco de dados

## Passos para Executar a Migração

### 1. Acessar o SQL Editor do Supabase

1. Faça login no [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto IgrejaConnect
3. No menu lateral, clique em "SQL Editor"

### 2. Executar a Migração

1. Abra o arquivo `migrations/004_user_management_system.sql`
2. Copie todo o conteúdo do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em "Run" para executar a migração

### 3. Verificar a Execução

Após executar a migração, você deve ver:

```
Migração 004 concluída com sucesso!
Usuários: X, Permissões: 19, Papéis: 6
```

### 4. Verificar as Tabelas Criadas

Execute as seguintes queries para verificar se tudo foi criado corretamente:

```sql
-- Verificar usuários
SELECT COUNT(*) as total_usuarios FROM church_users;

-- Verificar permissões
SELECT COUNT(*) as total_permissoes FROM permissions;

-- Verificar papéis
SELECT COUNT(*) as total_papeis FROM custom_roles;

-- Verificar relacionamentos papel-permissão
SELECT COUNT(*) as total_relacionamentos FROM role_permissions;
```

### 5. Testar o Sistema

1. Faça logout do sistema
2. Faça login novamente
3. Acesse a página de Gestão de Usuários (`/users`)
4. Verifique se você aparece na lista como Administrador
5. Teste a edição de permissões de outros usuários

## Estrutura Criada

### Tabelas

- `church_users` - Usuários do sistema
- `permissions` - Permissões disponíveis
- `custom_roles` - Papéis do sistema
- `role_permissions` - Relacionamento papel-permissão

### Permissões Criadas (19 total)

#### Dashboard (1)
- `dashboard.view`

#### Membros (5)
- `members.view`
- `members.create`
- `members.edit`
- `members.delete`
- `members.export`

#### Departamentos (4)
- `departments.view`
- `departments.create`
- `departments.edit`
- `departments.delete`

#### Eventos (4)
- `events.view`
- `events.create`
- `events.edit`
- `events.delete`

#### Financeiro (5)
- `financial.view`
- `financial.create`
- `financial.edit`
- `financial.delete`
- `financial.reports`

### Papéis Criados (6 total)

1. **Administrador** - Todas as permissões
2. **Pastor** - Membros, departamentos, eventos, visualização financeira
3. **Líder** - Membros, departamentos, eventos, notificações
4. **Tesoureiro** - Financeiro completo, visualização de membros
5. **Voluntário** - Visualização básica
6. **Membro** - Dashboard e eventos apenas

## Troubleshooting

### Erro: "relation already exists"
- Normal se executar a migração múltiplas vezes
- A migração usa `CREATE TABLE IF NOT EXISTS`

### Erro: "permission denied"
- Verifique se está usando o service role key
- Confirme as permissões no Supabase

### Usuário não aparece como Administrador
- Execute manualmente:
```sql
UPDATE church_users 
SET 
  role = 'Administrador',
  permissions = (SELECT ARRAY_AGG(name) FROM permissions)
WHERE email = 'SEU_EMAIL_AQUI';
```

### Permissões não estão sendo aplicadas
1. Faça logout/login para atualizar o token
2. Verifique se o usuário está ativo
3. Confirme se as permissões foram salvas corretamente

## Próximos Passos

Após executar a migração com sucesso:

1. **Teste o sistema completo**
   - Faça login com diferentes usuários
   - Teste as permissões de cada papel
   - Verifique se os guards estão funcionando

2. **Configure usuários adicionais**
   - Convide outros administradores
   - Defina papéis para usuários existentes
   - Teste a matriz de permissões

3. **Monitore o sistema**
   - Verifique logs de erro
   - Monitore performance das queries
   - Acompanhe uso das funcionalidades

## Rollback (se necessário)

Se precisar reverter a migração:

```sql
-- CUIDADO: Isso removerá todas as tabelas e dados
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS custom_roles CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS church_users CASCADE;

-- Remover triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at_column();
```

## Suporte

Se encontrar problemas:

1. Verifique os logs do Supabase
2. Consulte a documentação em `SISTEMA_GESTAO_USUARIOS.md`
3. Teste as APIs manualmente
4. Entre em contato com o suporte técnico

---

**Importante**: Faça backup do banco antes de executar a migração em produção!
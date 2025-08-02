# 📊 Como Usar as Migrações no Supabase

## 🎯 Sobre as Migrações

As migrações foram atualizadas para funcionar com **PostgreSQL** (Supabase) em vez de SQLite (Cloudflare D1).

### 📁 Arquivos de Migração

1. **`supabase-setup.sql`** - **USE ESTE** ✅
   - Configuração completa e moderna para Supabase
   - Inclui todas as tabelas, triggers, RLS e dados iniciais
   - **Recomendado para novos projetos**

2. **`migrations/1.sql`** - Estrutura básica (legado)
3. **`migrations/2.sql`** - Permissões e papéis (legado)
4. **`migrations/3.sql`** - Configurações de admin (atualizado)
5. **`migrations/4.sql`** - Departamentos (legado)

## 🚀 Configuração Recomendada

### Opção 1: Setup Completo (Recomendado)
```sql
-- Execute apenas este arquivo no Supabase SQL Editor
-- Arquivo: supabase-setup.sql
```

### Opção 2: Migrações Individuais
Se preferir executar as migrações separadamente:

```sql
-- 1. Primeiro execute migrations/1.sql
-- 2. Depois execute migrations/2.sql  
-- 3. Execute migrations/3.sql (atualizado)
-- 4. Por último migrations/4.sql
```

## 🔧 Como Executar no Supabase

### 1. Acesse o Supabase
1. Vá para: https://supabase.com/dashboard/project/pskaimoanrxcsjeaalrz
2. Clique em **SQL Editor**

### 2. Execute o Script
1. **Opção A**: Cole todo o conteúdo de `supabase-setup.sql`
2. **Opção B**: Execute as migrações uma por vez
3. Clique em **RUN**

### 3. Verifique se Funcionou
```sql
-- Verificar se as tabelas foram criadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verificar se o usuário admin foi configurado
SELECT * FROM church_users WHERE email = 'lucianofreireteles@gmail.com';

-- Verificar permissões
SELECT * FROM permissions LIMIT 5;
```

## 📋 O que a Migration 3 Faz

### ✅ Funcionalidades Principais

1. **Função `ensure_admin_permissions()`**
   - Garante que `lucianofreireteles@gmail.com` sempre seja Administrador
   - Executa automaticamente em INSERT/UPDATE

2. **Trigger Automático**
   - Aplica as permissões de admin automaticamente
   - Funciona quando o usuário faz login pela primeira vez

3. **Dados de Exemplo**
   - Membros de exemplo
   - Departamentos básicos
   - Transações financeiras de demonstração
   - Notificações iniciais

### 🔒 Segurança

- Função com `SECURITY DEFINER` para execução segura
- Trigger que só afeta o email específico do admin
- Não interfere com outros usuários

## 🎯 Resultado Esperado

Após executar a migração:

1. ✅ **Usuário Admin**: `lucianofreireteles@gmail.com` será automaticamente Administrador
2. ✅ **Dados de Exemplo**: Membros, departamentos e transações criados
3. ✅ **Sistema Funcional**: Pronto para uso imediato
4. ✅ **Segurança**: RLS e permissões configuradas

## 🔍 Troubleshooting

### Erro: "function does not exist"
- Execute primeiro o `supabase-setup.sql` completo

### Erro: "relation does not exist"
- Verifique se as tabelas foram criadas (migrations 1 e 2)

### Usuário não é admin
- Verifique se o trigger foi criado corretamente
- Execute manualmente: `SELECT ensure_admin_permissions();`

## 📈 Próximos Passos

1. ✅ **Execute a migração**
2. ✅ **Configure Google OAuth** (siga `RESOLVER_REDIRECT_URI.md`)
3. ✅ **Teste o login**
4. ✅ **Verifique se é admin** no perfil do usuário

**Sistema pronto para uso! 🚀**
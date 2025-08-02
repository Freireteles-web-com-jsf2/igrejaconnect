# Sistema de Gestão de Usuários e Permissões - IgrejaConnect

## Visão Geral

O sistema de gestão de usuários e permissões do IgrejaConnect permite que administradores controlem o acesso e as funcionalidades disponíveis para cada usuário do sistema. O sistema é baseado em papéis (roles) e permissões granulares.

## Funcionalidades Implementadas

### 1. Gestão de Usuários
- **Listagem de usuários**: Visualize todos os usuários cadastrados no sistema
- **Busca e filtros**: Encontre usuários por nome, email, papel ou status
- **Ativação/Desativação**: Controle quais usuários podem acessar o sistema
- **Estatísticas**: Visualize métricas sobre usuários ativos, inativos e por papel

### 2. Sistema de Permissões
- **Permissões granulares**: Controle específico por módulo e ação
- **Papéis predefinidos**: Sistema com 6 papéis padrão
- **Edição de permissões**: Personalize permissões para cada usuário
- **Matriz de permissões**: Visualização consolidada de todas as permissões

### 3. Visualizações Disponíveis

#### Lista de Usuários
- Visualização em cards com informações principais
- Filtros por papel, status e busca por texto
- Ações rápidas para editar permissões e alterar status
- Exportação de dados em CSV

#### Matriz de Permissões
- Visualização tabular de todos os usuários e suas permissões
- Filtros por módulo para facilitar a análise
- Exportação da matriz completa
- Indicadores visuais para permissões ativas

#### Log de Atividades
- Histórico de ações dos usuários (em desenvolvimento)
- Filtros por período e tipo de ação
- Informações de IP e user agent

## Papéis do Sistema

### 1. Administrador
- **Acesso total** ao sistema
- Pode gerenciar usuários e permissões
- Acesso a todas as funcionalidades
- **Permissões**: Todas disponíveis

### 2. Pastor
- Acesso a membros, departamentos e eventos
- Visualização de dados financeiros
- Criação de notificações e avisos
- **Permissões**:
  - Dashboard: visualizar
  - Membros: visualizar, criar, editar, exportar
  - Departamentos: visualizar, criar, editar
  - Eventos: visualizar, criar, editar
  - Financeiro: visualizar, relatórios
  - Notificações: visualizar, criar, editar

### 3. Líder
- Gestão de membros e departamentos
- Criação de eventos e notificações
- **Permissões**:
  - Dashboard: visualizar
  - Membros: visualizar, criar, editar
  - Departamentos: visualizar, criar, editar
  - Eventos: visualizar, criar, editar
  - Notificações: visualizar, criar

### 4. Tesoureiro
- Acesso total ao módulo financeiro
- Visualização de membros
- **Permissões**:
  - Dashboard: visualizar
  - Membros: visualizar
  - Eventos: visualizar
  - Financeiro: visualizar, criar, editar, excluir, relatórios

### 5. Voluntário
- Acesso básico de visualização
- **Permissões**:
  - Dashboard: visualizar
  - Membros: visualizar
  - Departamentos: visualizar
  - Eventos: visualizar
  - Notificações: visualizar

### 6. Membro
- Acesso mínimo ao sistema
- **Permissões**:
  - Dashboard: visualizar
  - Eventos: visualizar
  - Notificações: visualizar

## Módulos e Permissões

### Dashboard
- `dashboard.view`: Visualizar dashboard

### Membros
- `members.view`: Visualizar membros
- `members.create`: Criar novo membro
- `members.edit`: Editar membro
- `members.delete`: Excluir membro
- `members.export`: Exportar dados de membros

### Departamentos
- `departments.view`: Visualizar departamentos
- `departments.create`: Criar departamentos
- `departments.edit`: Editar departamentos
- `departments.delete`: Excluir departamentos

### Eventos
- `events.view`: Visualizar eventos
- `events.create`: Criar eventos
- `events.edit`: Editar eventos
- `events.delete`: Excluir eventos

### Financeiro
- `financial.view`: Visualizar dados financeiros
- `financial.create`: Criar transação financeira
- `financial.edit`: Editar transação financeira
- `financial.delete`: Excluir transação financeira
- `financial.reports`: Gerar relatórios financeiros

### Usuários
- `users.view`: Visualizar usuários
- `users.edit`: Editar usuários
- `users.permissions`: Gerenciar permissões

### Notificações
- `notifications.view`: Visualizar notificações
- `notifications.create`: Criar notificação
- `notifications.edit`: Editar notificação

### Configurações
- `settings.view`: Visualizar configurações
- `settings.edit`: Editar configurações

## Como Usar

### Acessando a Gestão de Usuários
1. Faça login como administrador
2. Acesse o menu lateral e clique em "Usuários"
3. Ou use a navegação rápida no topo da página

### Editando Permissões de um Usuário
1. Na lista de usuários, clique em "Editar" no usuário desejado
2. Selecione o papel apropriado no dropdown
3. Marque/desmarque as permissões específicas conforme necessário
4. Clique em "Salvar" para aplicar as alterações

### Ativando/Desativando Usuários
1. Na lista de usuários, clique no ícone de status (✓ ou ✗)
2. Confirme a ação
3. Usuários inativos não conseguem fazer login no sistema

### Visualizando a Matriz de Permissões
1. Na página de usuários, clique na aba "Matriz"
2. Use os filtros para focar em módulos específicos
3. Exporte a matriz para análise externa se necessário

### Exportando Dados
1. Use o botão "Exportar" na página de usuários
2. O arquivo CSV será baixado com informações dos usuários
3. Na matriz de permissões, use "Exportar" para baixar a matriz completa

## APIs Disponíveis

### Usuários
- `GET /api/users` - Listar usuários
- `GET /api/users/current` - Dados do usuário atual
- `PUT /api/users/:id/permissions` - Atualizar permissões
- `PUT /api/users/:id/status` - Ativar/desativar usuário
- `POST /api/users/sync` - Sincronizar usuário após login

### Permissões
- `GET /api/permissions` - Listar permissões disponíveis
- `GET /api/roles` - Listar papéis disponíveis
- `GET /api/roles/:name/permissions` - Permissões de um papel

## Estrutura do Banco de Dados

### Tabela `church_users`
```sql
- id (UUID, PK) - ID do usuário (referência para auth.users)
- email (TEXT) - Email do usuário
- name (TEXT) - Nome completo
- role (TEXT) - Papel do usuário
- permissions (TEXT[]) - Array de permissões específicas
- is_active (BOOLEAN) - Status ativo/inativo
- phone (TEXT) - Telefone
- birth_date (DATE) - Data de nascimento
- address (TEXT) - Endereço
- avatar_url (TEXT) - URL da foto de perfil
- created_at (TIMESTAMP) - Data de criação
- updated_at (TIMESTAMP) - Data de atualização
```

### Tabela `permissions`
```sql
- id (SERIAL, PK) - ID da permissão
- name (TEXT) - Nome único da permissão
- description (TEXT) - Descrição da permissão
- module (TEXT) - Módulo ao qual pertence
- action (TEXT) - Ação que permite
- created_at (TIMESTAMP) - Data de criação
- updated_at (TIMESTAMP) - Data de atualização
```

### Tabela `custom_roles`
```sql
- id (SERIAL, PK) - ID do papel
- name (TEXT) - Nome único do papel
- description (TEXT) - Descrição do papel
- is_system_role (BOOLEAN) - Se é um papel do sistema
- created_by (UUID) - Quem criou o papel
- created_at (TIMESTAMP) - Data de criação
- updated_at (TIMESTAMP) - Data de atualização
```

### Tabela `role_permissions`
```sql
- id (SERIAL, PK) - ID do relacionamento
- role_name (TEXT) - Nome do papel
- permission_id (INTEGER) - ID da permissão
- created_at (TIMESTAMP) - Data de criação
```

## Segurança

### Row Level Security (RLS)
- Todas as tabelas têm RLS habilitado
- Usuários só podem ver/editar seus próprios dados
- Administradores têm acesso total via service role

### Autenticação
- Integração com Supabase Auth
- Login via Google OAuth
- Tokens JWT para autenticação de API

### Autorização
- Middleware de autenticação em todas as rotas protegidas
- Verificação de permissões no frontend e backend
- Guards de componentes para controle de acesso

## Próximas Funcionalidades

### Em Desenvolvimento
- [ ] Log de atividades real (atualmente mock)
- [ ] Criação de papéis personalizados
- [ ] Notificações por email para alterações de permissão
- [ ] Auditoria completa de ações dos usuários
- [ ] Sessões ativas e controle de logout remoto

### Planejadas
- [ ] Integração com Active Directory/LDAP
- [ ] Autenticação de dois fatores (2FA)
- [ ] Políticas de senha avançadas
- [ ] Grupos de usuários
- [ ] Delegação de permissões temporárias

## Troubleshooting

### Problemas Comuns

#### Usuário não aparece na lista
- Verifique se o usuário fez login pelo menos uma vez
- Confirme se a sincronização automática está funcionando
- Execute manualmente a API `/api/users/sync`

#### Permissões não estão sendo aplicadas
- Verifique se o usuário está ativo
- Confirme se as permissões foram salvas corretamente
- Faça logout/login para atualizar o token

#### Erro ao salvar permissões
- Verifique se o usuário atual é administrador
- Confirme se a conexão com o banco está funcionando
- Verifique os logs do servidor para detalhes

### Logs e Debug
- Use o console do navegador para ver erros de frontend
- Verifique os logs do Cloudflare Worker para erros de API
- Use o Supabase Dashboard para monitorar queries

## Suporte

Para suporte técnico ou dúvidas sobre o sistema:
1. Verifique esta documentação primeiro
2. Consulte os logs de erro
3. Entre em contato com o administrador do sistema
4. Reporte bugs através do sistema de issues

---

**Versão**: 1.0.0  
**Última atualização**: Janeiro 2025  
**Desenvolvido para**: IgrejaConnect
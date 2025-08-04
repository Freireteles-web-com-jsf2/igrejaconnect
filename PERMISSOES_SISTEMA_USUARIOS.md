# 🔐 Sistema de Permissões - IgrejaConnect

## 📋 **Estrutura de Permissões**

O sistema utiliza permissões granulares no formato `módulo.ação` para controle de acesso detalhado.

---

## 🏗️ **Módulos do Sistema**

### 1. **Dashboard** (`dashboard`)
- `dashboard.view` - Visualizar painel principal

### 2. **Membros** (`members`)
- `members.view` - Visualizar lista de membros
- `members.create` - Cadastrar novos membros
- `members.edit` - Editar dados de membros
- `members.delete` - Excluir membros
- `members.export` - Exportar dados de membros

### 3. **Departamentos** (`departments`)
- `departments.view` - Visualizar departamentos
- `departments.create` - Criar novos departamentos
- `departments.edit` - Editar departamentos
- `departments.delete` - Excluir departamentos

### 4. **Eventos** (`events`)
- `events.view` - Visualizar eventos
- `events.create` - Criar novos eventos
- `events.edit` - Editar eventos
- `events.delete` - Excluir eventos

### 5. **Financeiro** (`financial`)
- `financial.view` - Visualizar dados financeiros
- `financial.create` - Registrar transações
- `financial.edit` - Editar transações
- `financial.delete` - Excluir transações
- `financial.reports` - Gerar relatórios financeiros

### 6. **Usuários** (`users`)
- `users.view` - Visualizar usuários do sistema
- `users.edit` - Editar dados de usuários
- `users.permissions` - Gerenciar permissões de usuários

### 7. **Notificações** (`notifications`)
- `notifications.view` - Visualizar notificações
- `notifications.create` - Criar notificações
- `notifications.edit` - Editar notificações

### 8. **Configurações** (`settings`)
- `settings.view` - Visualizar configurações
- `settings.edit` - Editar configurações do sistema

---

## 👥 **Papéis do Sistema e Suas Permissões**

### 🔴 **Administrador** (Acesso Total)
```
✅ Dashboard:
   - dashboard.view

✅ Membros:
   - members.view
   - members.create
   - members.edit
   - members.delete
   - members.export

✅ Departamentos:
   - departments.view
   - departments.create
   - departments.edit
   - departments.delete

✅ Eventos:
   - events.view
   - events.create
   - events.edit
   - events.delete

✅ Financeiro:
   - financial.view
   - financial.create
   - financial.edit
   - financial.delete
   - financial.reports

✅ Usuários:
   - users.view
   - users.edit
   - users.permissions

✅ Notificações:
   - notifications.view
   - notifications.create
   - notifications.edit

✅ Configurações:
   - settings.view
   - settings.edit
```

### 🔵 **Pastor** (Gestão Pastoral)
```
✅ Dashboard:
   - dashboard.view

✅ Membros:
   - members.view
   - members.create
   - members.edit
   - members.export

✅ Departamentos:
   - departments.view
   - departments.create
   - departments.edit

✅ Eventos:
   - events.view
   - events.create
   - events.edit

✅ Financeiro:
   - financial.view
   - financial.reports

✅ Notificações:
   - notifications.view
   - notifications.create
   - notifications.edit
```

### 🟠 **Líder** (Gestão de Departamento)
```
✅ Dashboard:
   - dashboard.view

✅ Membros:
   - members.view
   - members.create
   - members.edit

✅ Departamentos:
   - departments.view
   - departments.create
   - departments.edit

✅ Eventos:
   - events.view
   - events.create
   - events.edit

✅ Notificações:
   - notifications.view
   - notifications.create
```

### 🟢 **Tesoureiro** (Gestão Financeira)
```
✅ Dashboard:
   - dashboard.view

✅ Membros:
   - members.view

✅ Eventos:
   - events.view

✅ Financeiro:
   - financial.view
   - financial.create
   - financial.edit
   - financial.delete
   - financial.reports
```

### 🟡 **Voluntário** (Acesso Limitado)
```
✅ Dashboard:
   - dashboard.view

✅ Membros:
   - members.view

✅ Departamentos:
   - departments.view

✅ Eventos:
   - events.view

✅ Notificações:
   - notifications.view
```

### ⚪ **Membro** (Visualização Básica)
```
✅ Dashboard:
   - dashboard.view

✅ Eventos:
   - events.view

✅ Notificações:
   - notifications.view
```

---

## 🔒 **Regras de Segurança Especiais**

### **Financeiro**
- Apenas **Administrador** e **Tesoureiro** podem editar dados financeiros
- Validação especial: `PermissionHelper.canEditFinancial(role)`

### **Gestão de Usuários**
- Apenas **Administrador** pode gerenciar usuários
- Validação especial: `PermissionHelper.canManageUsers(role)`

### **Membros**
- Validações específicas para cada ação:
  - `PermissionHelper.canCreateMembers(permissions)`
  - `PermissionHelper.canEditMembers(permissions)`
  - `PermissionHelper.canDeleteMembers(permissions)`

---

## 📊 **Resumo por Ações**

### **Visualização (VIEW)**
- **Todos os papéis**: Dashboard, Eventos, Notificações
- **Exceto Membro**: Membros, Departamentos
- **Administrador/Pastor/Tesoureiro**: Financeiro
- **Apenas Administrador**: Usuários, Configurações

### **Criação (CREATE)**
- **Administrador**: Todos os módulos
- **Pastor/Líder**: Membros, Departamentos, Eventos, Notificações
- **Tesoureiro**: Apenas Financeiro

### **Edição (EDIT)**
- **Administrador**: Todos os módulos
- **Pastor**: Membros, Departamentos, Eventos, Notificações
- **Líder**: Membros, Departamentos, Eventos
- **Tesoureiro**: Apenas Financeiro

### **Exclusão (DELETE)**
- **Administrador**: Membros, Departamentos, Eventos, Financeiro
- **Tesoureiro**: Apenas Financeiro

### **Relatórios (REPORTS)**
- **Administrador/Pastor/Tesoureiro**: Financeiro

### **Exportação (EXPORT)**
- **Administrador/Pastor**: Membros

### **Gerenciamento de Permissões (PERMISSIONS)**
- **Apenas Administrador**: Usuários

---

## 🛡️ **Sistema de Validação**

### **Componentes de Proteção**
```typescript
// Proteção por permissão específica
<PermissionGuard permission="members.create">
  <CreateMemberButton />
</PermissionGuard>

// Proteção por módulo e ação
<PermissionGuard module={PermissionModule.FINANCIAL} action={PermissionAction.EDIT}>
  <EditFinancialButton />
</PermissionGuard>

// Proteção por papel
<AdminOnly>
  <UserManagementPage />
</AdminOnly>
```

### **Hooks de Validação**
```typescript
const { hasPermission, hasModuleAccess, canEditFinancial } = usePermissions();

// Verificar permissão específica
if (hasPermission('members.create')) {
  // Mostrar botão de criar membro
}

// Verificar acesso ao módulo
if (hasModuleAccess(PermissionModule.FINANCIAL, PermissionAction.VIEW)) {
  // Mostrar dados financeiros
}

// Verificar função especial
if (canEditFinancial()) {
  // Permitir edição financeira
}
```

---

## 📈 **Total de Permissões**

### **Por Módulo**:
- Dashboard: 1 permissão
- Membros: 5 permissões
- Departamentos: 4 permissões
- Eventos: 4 permissões
- Financeiro: 5 permissões
- Usuários: 3 permissões
- Notificações: 3 permissões
- Configurações: 2 permissões

### **Total Geral**: **27 permissões únicas**

### **Por Papel**:
- Administrador: 27 permissões (100%)
- Pastor: 15 permissões (56%)
- Líder: 11 permissões (41%)
- Tesoureiro: 7 permissões (26%)
- Voluntário: 5 permissões (19%)
- Membro: 3 permissões (11%)

---

## 🔧 **Como Gerenciar Permissões**

1. **Acesse**: `http://localhost:5173/users`
2. **Selecione usuário**: Clique em "Editar"
3. **Escolha papel**: Selecione o papel apropriado
4. **Ajuste permissões**: Marque/desmarque permissões específicas
5. **Valide**: Sistema mostra alertas se houver problemas
6. **Salve**: Confirme as alterações

O sistema oferece **controle granular** e **validação inteligente** para garantir segurança e funcionalidade adequada para cada tipo de usuário! 🎯
# 🧪 Teste de Validação - Permissões do Papel "Membro"

## 🎯 **Objetivo do Teste:**
Validar que usuários com papel "Membro" não conseguem criar, editar ou excluir registros no sistema.

## 📋 **Pré-requisitos:**
1. ✅ Servidor reiniciado com as correções aplicadas
2. ✅ Usuário configurado com papel "Membro"
3. ✅ Login realizado com usuário "Membro"

## 🧪 **Testes a Realizar:**

### **1. Teste Frontend (Interface)**
#### ✅ **Deve estar OCULTO:**
- [ ] Botão "Novo Membro" na página `/members`
- [ ] Botão "Editar" na lista de membros
- [ ] Botão "Excluir" na lista de membros
- [ ] Botão "Novo Departamento" na página `/departments`
- [ ] Botão "Editar" na lista de departamentos
- [ ] Botão "Excluir" na lista de departamentos
- [ ] Botão "Novo Evento" na página `/events`
- [ ] Botão "Editar" na lista de eventos
- [ ] Botão "Excluir" na lista de eventos
- [ ] Botão "Nova Transação" na página `/finance`
- [ ] Botão "Editar" na lista de transações
- [ ] Botão "Excluir" na lista de transações
- [ ] Botões de criar notificações na página `/notifications`

#### ✅ **Deve estar VISÍVEL:**
- [ ] Dashboard com estatísticas
- [ ] Lista de membros (apenas visualização)
- [ ] Lista de departamentos (apenas visualização)
- [ ] Lista de eventos (apenas visualização)
- [ ] Lista de transações financeiras (apenas visualização)
- [ ] Lista de notificações (apenas visualização)

### **2. Teste Backend (API) - Via Console do Navegador**

#### 🔒 **Teste 1: Criar Membro (deve falhar)**
```javascript
fetch('/api/members', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('supabase.auth.token')
  },
  body: JSON.stringify({
    name: 'Teste Membro',
    email: 'teste@teste.com',
    phone: '11999999999',
    status: 'ativo'
  })
}).then(r => r.json()).then(console.log);
```
**Resultado Esperado:** `{"error": "Permissão insuficiente", "required": "members.create", ...}`

#### 🔒 **Teste 2: Editar Membro (deve falhar)**
```javascript
fetch('/api/members/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('supabase.auth.token')
  },
  body: JSON.stringify({
    name: 'Nome Editado',
    email: 'editado@teste.com'
  })
}).then(r => r.json()).then(console.log);
```
**Resultado Esperado:** `{"error": "Permissão insuficiente", "required": "members.edit", ...}`

#### 🔒 **Teste 3: Excluir Membro (deve falhar)**
```javascript
fetch('/api/members/1', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('supabase.auth.token')
  }
}).then(r => r.json()).then(console.log);
```
**Resultado Esperado:** `{"error": "Permissão insuficiente", "required": "members.delete", ...}`

#### 🔒 **Teste 4: Criar Departamento (deve falhar)**
```javascript
fetch('/api/departments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('supabase.auth.token')
  },
  body: JSON.stringify({
    name: 'Teste Departamento',
    description: 'Teste'
  })
}).then(r => r.json()).then(console.log);
```
**Resultado Esperado:** `{"error": "Permissão insuficiente", "required": "departments.create", ...}`

#### 🔒 **Teste 5: Criar Evento (deve falhar)**
```javascript
fetch('/api/events', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('supabase.auth.token')
  },
  body: JSON.stringify({
    title: 'Teste Evento',
    event_type: 'culto',
    start_datetime: '2024-12-31T10:00:00Z'
  })
}).then(r => r.json()).then(console.log);
```
**Resultado Esperado:** `{"error": "Permissão insuficiente", "required": "events.create", ...}`

#### 🔒 **Teste 6: Criar Transação Financeira (deve falhar)**
```javascript
fetch('/api/financial/transactions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('supabase.auth.token')
  },
  body: JSON.stringify({
    type: 'entrada',
    amount: 100.00,
    description: 'Teste',
    category: 'dizimo'
  })
}).then(r => r.json()).then(console.log);
```
**Resultado Esperado:** `{"error": "Permissão insuficiente", "required": "financial.create", ...}`

#### 🔒 **Teste 7: Criar Notificação (deve falhar)**
```javascript
fetch('/api/notifications', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('supabase.auth.token')
  },
  body: JSON.stringify({
    title: 'Teste Notificação',
    message: 'Teste',
    type: 'info'
  })
}).then(r => r.json()).then(console.log);
```
**Resultado Esperado:** `{"error": "Permissão insuficiente", "required": "notifications.create", ...}`

## ✅ **Critérios de Sucesso:**
- [ ] Todos os botões de ação estão ocultos no frontend
- [ ] Todas as tentativas de API retornam erro 403 com mensagem de permissão insuficiente
- [ ] Usuário consegue visualizar todos os dados normalmente
- [ ] Sistema registra tentativas de acesso negado nos logs

## 🚨 **Se algum teste falhar:**
1. Verificar se o servidor foi reiniciado após as correções
2. Verificar se o usuário realmente tem papel "Membro"
3. Verificar se o token de autenticação está válido
4. Verificar os logs do servidor para erros

## 📝 **Resultado do Teste:**
- **Data do Teste:** ___________
- **Testado por:** ___________
- **Status:** [ ] ✅ Aprovado [ ] ❌ Reprovado
- **Observações:** ___________
# 🔧 Debug - Persistência de Permissões

## 🎯 **Problema Identificado**
As alterações de permissões feitas pelo Administrador não estão sendo aplicadas/persistidas no sistema.

## 🛠️ **Melhorias Implementadas**

### 1. **Sistema de Debug Avançado**
```typescript
// Logs detalhados da API
console.log('✅ API call successful');
console.log('❌ API call failed:', apiError);

// Logs de usuários carregados
console.log('👥 Usuários carregados:', users.length);
users.forEach(user => {
  console.log(`- ${user.email}: ${user.churchRole} (${user.userPermissions?.length || 0} permissões)`);
});
```

### 2. **Sistema de Cache Local**
- Atualizações locais imediatas para feedback visual
- Fallback quando a API falha
- Persistência visual das alterações

### 3. **Teste de API Integrado**
- Verificação automática da conectividade da API
- Teste antes de cada salvamento
- Feedback específico sobre problemas de conexão

### 4. **Tratamento Robusto de Erros**
- Try-catch detalhado
- Fallback para atualizações locais
- Toasts informativos sobre o status

## 🧪 **Como Diagnosticar o Problema**

### **Passo 1: Acesse e Abra o Console**
```
URL: http://localhost:5173/users
Console: F12 → Console
```

### **Passo 2: Observe os Logs Iniciais**
Ao carregar a página, você deve ver:
```
👥 Usuários carregados: X
- usuario1@igreja.com: Administrador (27 permissões)
- usuario2@igreja.com: Pastor (15 permissões)
...
```

### **Passo 3: Teste a Edição de Permissões**
1. **Clique em "Editar"** em qualquer usuário
2. **Observe os logs:**
   ```
   📄 Usuário atual da API: {dados do usuário}
   ✅ API está respondendo, prosseguindo com salvamento...
   ```

### **Passo 4: Faça Alterações**
1. **Mude o papel** no dropdown
2. **Marque/desmarque permissões**
3. **Clique em "Salvar"**

### **Passo 5: Verifique os Logs de Salvamento**
Você deve ver uma das seguintes sequências:

#### **✅ Cenário de Sucesso:**
```
🧪 Testando API de permissões...
📄 Usuário atual da API: {dados}
✅ API está respondendo, prosseguindo com salvamento...
Salvando permissões para: usuario@igreja.com
Payload enviado: {role: "Pastor", permissions: [...]}
✅ API call successful
🔄 Forçando atualização dos dados...
✅ Dados atualizados
```

#### **❌ Cenário de Falha da API:**
```
🧪 Testando API de permissões...
❌ Erro ao testar API: {erro}
❌ Não foi possível conectar com o servidor
```

#### **⚠️ Cenário de Fallback:**
```
✅ API está respondendo, prosseguindo com salvamento...
❌ API call failed: {erro}
🔄 Tentando atualização local como fallback...
📝 Dados atualizados localmente para usuário: {id}
```

## 🔍 **Possíveis Problemas e Soluções**

### **Problema 1: API Não Responde**
**Sintomas:**
- Logs mostram "❌ API não está respondendo"
- Toast de erro de conexão

**Soluções:**
- Verificar se o servidor backend está rodando
- Verificar endpoint `/api/users/{id}/permissions`
- Verificar autenticação/autorização

### **Problema 2: API Responde mas Não Persiste**
**Sintomas:**
- Logs mostram "✅ API call successful"
- Mas dados não mudam após reload

**Soluções:**
- Verificar implementação do endpoint PUT
- Verificar se dados estão sendo salvos no banco
- Verificar se GET retorna dados atualizados

### **Problema 3: Dados Não Atualizam na Interface**
**Sintomas:**
- API funciona mas interface não reflete mudanças
- Logs mostram sucesso mas visualmente não muda

**Soluções:**
- Verificar se `refetchUsers()` está funcionando
- Verificar se cache local está sendo aplicado
- Verificar se componente está re-renderizando

### **Problema 4: Permissões Não Aplicadas no Sistema**
**Sintomas:**
- Interface mostra mudanças
- Mas usuário ainda tem permissões antigas

**Soluções:**
- Verificar se sistema de permissões usa dados atualizados
- Verificar cache de permissões
- Verificar se logout/login resolve

## 🎯 **Testes Específicos**

### **Teste 1: Conectividade da API**
```javascript
// No console do navegador:
fetch('/api/users', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('supabase_token') }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

### **Teste 2: Endpoint de Permissões**
```javascript
// Substituir {USER_ID} pelo ID real:
fetch('/api/users/{USER_ID}/permissions', {
  method: 'PUT',
  headers: { 
    'Authorization': 'Bearer ' + localStorage.getItem('supabase_token'),
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    role: 'Pastor',
    permissions: ['dashboard.view', 'members.view']
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

### **Teste 3: Verificar Dados Atualizados**
```javascript
// Após salvar, verificar se dados mudaram:
fetch('/api/users/{USER_ID}', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('supabase_token') }
})
.then(r => r.json())
.then(user => {
  console.log('Papel atual:', user.role || user.churchRole);
  console.log('Permissões:', user.permissions || user.userPermissions);
});
```

## 📊 **Checklist de Diagnóstico**

### **Frontend (Interface)**
- [ ] Editor abre corretamente
- [ ] Dados carregam no editor
- [ ] Mudanças são visíveis no Debug Info
- [ ] Botão Salvar funciona
- [ ] Toasts aparecem

### **API (Comunicação)**
- [ ] Teste de API retorna dados
- [ ] Endpoint PUT responde sem erro
- [ ] Payload está correto
- [ ] Autenticação está funcionando

### **Backend (Persistência)**
- [ ] Dados são salvos no banco
- [ ] GET retorna dados atualizados
- [ ] Não há cache impedindo atualizações

### **Sistema (Aplicação)**
- [ ] Permissões são aplicadas imediatamente
- [ ] Logout/login reflete mudanças
- [ ] Outros usuários veem as mudanças

## 🎯 **Próximos Passos Baseados no Diagnóstico**

### **Se API Não Responde:**
1. Verificar servidor backend
2. Verificar rotas da API
3. Verificar autenticação

### **Se API Responde mas Não Persiste:**
1. Verificar implementação do endpoint
2. Verificar banco de dados
3. Verificar logs do servidor

### **Se Interface Não Atualiza:**
1. Verificar refetch dos dados
2. Verificar re-renderização
3. Verificar cache local

### **Se Sistema Não Aplica Permissões:**
1. Verificar hook usePermissions
2. Verificar cache de sessão
3. Verificar sincronização de dados

---

**Execute os testes e reporte os resultados específicos para identificar exatamente onde está o problema!** 🚀
# 🔧 Debug - Editor de Permissões

## 🎯 **Problema Identificado**
O formulário de editar permissões não estava aplicando as atualizações corretamente.

## 🛠️ **Soluções Implementadas**

### 1. **Editor Simplificado para Debug**
Criado componente `SimplePermissionEditor` para isolar e testar a funcionalidade básica.

### 2. **Logs de Debug Adicionados**
```typescript
// Logs no handleEditUser
console.log('Editando usuário:', user);
console.log('Papel atual (churchRole):', user.churchRole);
console.log('Papel atual (role):', (user as any).role);
console.log('Permissões atuais:', user.userPermissions);

// Logs no handleSavePermissions
console.log('Salvando permissões...');
console.log('Usuário:', selectedUser.email);
console.log('Papel selecionado:', selectedRole);
console.log('Permissões selecionadas:', userPermissions);
```

### 3. **API Temporariamente Desabilitada**
Para testar se o problema está no frontend ou backend, a chamada da API foi comentada temporariamente.

## 🧪 **Como Testar**

### **Passo 1: Acesse a Página**
```
http://localhost:5173/users
```

### **Passo 2: Abra o Console do Navegador**
- Pressione `F12`
- Vá para a aba "Console"

### **Passo 3: Edite um Usuário**
1. Clique em "Editar" em qualquer usuário
2. Observe os logs no console:
   ```
   Editando usuário: {objeto do usuário}
   Papel atual (churchRole): "Administrador"
   Permissões atuais: ["dashboard.view", ...]
   ```

### **Passo 4: Teste o Editor Simplificado**
1. **Mude o Papel**: Selecione um papel diferente no dropdown
2. **Observe**: As permissões devem mudar automaticamente
3. **Marque/Desmarque**: Teste marcar e desmarcar permissões individuais
4. **Veja o Debug**: A seção "Debug Info" mostra o estado atual

### **Passo 5: Salve as Alterações**
1. Clique em "Salvar"
2. Observe os logs no console:
   ```
   Received from SimpleEditor: {role: "Pastor", permissions: [...]}
   Salvando permissões...
   Payload enviado: {role: "Pastor", permissions: [...]}
   ```

## 🔍 **O Que Verificar**

### **✅ Funcionando Corretamente:**
- [ ] Logs aparecem no console ao editar usuário
- [ ] Papel é carregado corretamente no dropdown
- [ ] Permissões são carregadas corretamente
- [ ] Mudança de papel atualiza permissões automaticamente
- [ ] Marcar/desmarcar permissões funciona
- [ ] Debug Info mostra dados corretos
- [ ] Logs de salvamento aparecem no console

### **❌ Possíveis Problemas:**
- [ ] Papel vem como `undefined` ou `null`
- [ ] Permissões vêm como array vazio
- [ ] Mudança de papel não atualiza permissões
- [ ] Checkboxes não respondem aos cliques
- [ ] Debug Info não atualiza
- [ ] Logs de salvamento não aparecem

## 🔧 **Próximos Passos Baseados no Teste**

### **Se o Editor Simplificado Funcionar:**
1. O problema está no editor original (complexidade excessiva)
2. Substituir o editor original pelo simplificado
3. Reativar a chamada da API
4. Testar salvamento real

### **Se o Editor Simplificado Não Funcionar:**
1. O problema está nos dados vindos da API
2. Verificar estrutura dos dados de usuário
3. Corrigir mapeamento de campos (`role` vs `churchRole`)
4. Verificar se permissões estão no formato correto

### **Se os Logs Não Aparecerem:**
1. Problema na função `handleEditUser`
2. Verificar se o botão "Editar" está chamando a função correta
3. Verificar se há erros JavaScript bloqueando a execução

## 📊 **Dados Esperados**

### **Estrutura do Usuário:**
```typescript
{
  id: "uuid",
  email: "usuario@igreja.com",
  churchRole: "Administrador", // ou role
  userPermissions: ["dashboard.view", "members.view", ...],
  google_user_data: {
    name: "Nome do Usuário",
    picture: "url_da_foto"
  },
  is_active: true
}
```

### **Permissões por Papel:**
- **Administrador**: 27 permissões
- **Pastor**: 15 permissões  
- **Líder**: 11 permissões
- **Tesoureiro**: 7 permissões
- **Voluntário**: 5 permissões
- **Membro**: 3 permissões

## 🎯 **Objetivo Final**
Identificar se o problema está:
1. **Frontend**: Lógica de estado, eventos, renderização
2. **Backend**: API, estrutura de dados, salvamento
3. **Integração**: Comunicação entre frontend e backend

---

**Execute os testes e reporte os resultados para prosseguir com a correção adequada!** 🚀
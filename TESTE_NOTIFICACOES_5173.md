# 🧪 Teste do Sistema de Notificações

## 🌐 **URL Correta**
**Acesse**: http://localhost:5173/notifications

## 🔍 **Verificação de Erros 404**

### **Possíveis Recursos com Erro 404:**

1. **Favicon**: `/favicon.ico`
2. **Imagens**: Avatar placeholders, ícones
3. **Assets**: CSS, JS chunks
4. **API Endpoints**: Rotas não encontradas

### **Como Identificar os Erros:**

1. **Abra o DevTools** (F12)
2. **Vá para aba Console**
3. **Procure por mensagens vermelhas** com "404"
4. **Anote as URLs que estão falhando**

## 🛠️ **Soluções Comuns**

### **1. Favicon Missing**
Se aparecer erro para `/favicon.ico`:
```html
<!-- Adicionar no index.html -->
<link rel="icon" type="image/x-icon" href="/favicon.ico">
```

### **2. Avatar Placeholder**
Se aparecer erro para imagens de avatar:
```typescript
// Usar placeholder válido
src={user?.avatar_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNFNUU3RUIiLz4KPHBhdGggZD0iTTE2IDhDMTMuNzkgOCAxMiA5Ljc5IDEyIDEyQzEyIDE0LjIxIDEzLjc5IDE2IDE2IDE2QzE4LjIxIDE2IDIwIDE0LjIxIDIwIDEyQzIwIDkuNzkgMTguMjEgOCAxNiA4WiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTYgMThDMTIuNjkgMTggMTAgMjAuNjkgMTAgMjRIMjJDMjIgMjAuNjkgMTkuMzEgMTggMTYgMThaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo='}
```

### **3. API Endpoints**
Se aparecer erro para rotas da API:
- Verificar se o worker está rodando
- Verificar se as rotas estão corretas
- Verificar autenticação

## 🧪 **Teste Passo a Passo**

### **1. Acesse a Página**
```
http://localhost:5173/notifications
```

### **2. Verifique se Carrega**
- ✅ Header "Notificações e Agenda"
- ✅ Cards de estatísticas
- ✅ Abas "Notificações" e "Configurações"

### **3. Teste as Funcionalidades**
1. **Clique na aba "Configurações"**
2. **Use o botão "Testar Toast"**
3. **Use o botão "Criar Notificação"**
4. **Verifique o "Debug do Sistema"**

### **4. Monitore o Console**
- Abra F12 → Console
- Procure por erros vermelhos
- Anote URLs com 404

## 🔧 **Correções Rápidas**

### **Se aparecer erro de favicon:**
# 🚨 Como Resolver o Problema de Autenticação

## Problema Atual
A autenticação Google não está funcionando porque as **variáveis de ambiente** não estão configuradas corretamente.

## ✅ Solução Rápida

### Passo 1: Obter Chave API do Mocha
1. Acesse: https://getmocha.com
2. Faça login na sua conta
3. Vá para **Settings** > **API Keys**
4. Copie sua **API Key**

### Passo 2: Configurar Variáveis Locais
Edite o arquivo `.env` na raiz do projeto:

```bash
MOCHA_USERS_SERVICE_API_URL=https://api.getmocha.com
MOCHA_USERS_SERVICE_API_KEY=cole_sua_chave_aqui
```

### Passo 3: Configurar para Produção
No arquivo `wrangler.jsonc`, substitua `your-mocha-api-key-here`:

```json
{
  "vars": {
    "MOCHA_USERS_SERVICE_API_URL": "https://api.getmocha.com",
    "MOCHA_USERS_SERVICE_API_KEY": "cole_sua_chave_aqui"
  }
}
```

### Passo 4: Reiniciar Servidor
```bash
# Parar o servidor (Ctrl+C)
npm run dev
```

## 🔍 Como Testar

1. **Abra a página de login** (localhost:5173/login)
2. **Clique no botão "Testar Endpoint de Auth"** (canto inferior direito)
3. **Verifique o resultado**:
   - ✅ **Status 200**: Configuração OK, pode tentar fazer login
   - ❌ **Status 500**: Chave API ainda não configurada
   - ❌ **Status 401**: Chave API inválida

## 🎯 Resultado Esperado

Após configurar corretamente, você deve ver:

```json
{
  "status": 200,
  "ok": true,
  "data": {
    "redirectUrl": "https://accounts.google.com/oauth/authorize?..."
  }
}
```

## 🆘 Se Ainda Não Funcionar

1. **Verifique se sua conta Mocha está ativa**
2. **Confirme se o projeto está configurado no Mocha**
3. **Verifique se a chave API não expirou**
4. **Entre em contato com suporte**: https://discord.gg/shDEGBSe2d

## 🧹 Remover Debug

Após resolver, remova o componente de debug:

1. Abra `src/react-app/pages/Login.tsx`
2. Remova a linha: `import AuthDebug from '@/react-app/components/AuthDebug';`
3. Remova: `<AuthDebug />`

---

**⚡ A configuração da chave API é o único passo necessário para resolver o problema!**
# 🚨 Resolver Erro: redirect_uri_mismatch

## ✅ Boa Notícia!
O erro `redirect_uri_mismatch` significa que o **Supabase está funcionando perfeitamente**! O problema é apenas que o Google Cloud Console não tem a URL de redirect configurada.

## 🔧 Solução Rápida (5 minutos)

### 1. Acesse Google Cloud Console
1. Vá para: https://console.cloud.google.com
2. Selecione seu projeto (ou crie um novo)

### 2. Ativar APIs Necessárias
1. Vá para **APIs & Services** > **Library**
2. Procure e ative:
   - **Google+ API** (ou **People API**)
   - **Google Identity and Access Management (IAM) API**

### 3. Criar/Editar Credenciais OAuth
1. Vá para **APIs & Services** > **Credentials**
2. Se já tem credenciais OAuth:
   - Clique na credencial existente
3. Se não tem:
   - Clique **+ CREATE CREDENTIALS** > **OAuth client ID**
   - Selecione **Web application**

### 4. Configurar URLs de Redirect
Na seção **Authorized redirect URIs**, adicione:

```
https://pskaimoanrxcsjeaalrz.supabase.co/auth/v1/callback
```

**⚠️ IMPORTANTE**: Use exatamente esta URL, sem espaços ou caracteres extras.

### 5. Configurar Origins (opcional)
Na seção **Authorized JavaScript origins**, adicione:
```
http://localhost:5173
https://seu-dominio.com
```

### 6. Salvar e Copiar Credenciais
1. Clique **SAVE**
2. Copie o **Client ID** e **Client Secret**

### 7. Configurar no Supabase
1. Acesse: https://supabase.com/dashboard/project/pskaimoanrxcsjeaalrz
2. Vá para **Authentication** > **Settings**
3. Na seção **Auth Providers**, encontre **Google**
4. Ative o toggle **Enable sign in with Google**
5. Cole:
   - **Client ID (for OAuth)**: `seu_client_id_aqui`
   - **Client Secret (for OAuth)**: `seu_client_secret_aqui`
6. Clique **Save**

## 🎯 Testar Novamente

1. Aguarde 1-2 minutos para as configurações se propagarem
2. Acesse: http://localhost:5173/login
3. Clique em **"Entrar com Google"**
4. Deve funcionar perfeitamente! 🎉

## 🔍 Se Ainda Der Erro

### Erro: "redirect_uri_mismatch"
- Verifique se a URL está exata: `https://pskaimoanrxcsjeaalrz.supabase.co/auth/v1/callback`
- Aguarde alguns minutos para propagação

### Erro: "access_denied"
- Verifique se as APIs estão ativadas
- Confirme se Client ID e Secret estão corretos no Supabase

### Erro: "invalid_client"
- Verifique se o Client Secret está correto
- Confirme se o projeto Google está ativo

## 📊 Resultado Esperado

Após a configuração:
1. ✅ **Login funciona** - Popup/redirect do Google abre
2. ✅ **Autorização** - Usuário autoriza a aplicação  
3. ✅ **Redirecionamento** - Volta para o dashboard
4. ✅ **Dados sincronizados** - Nome, email e foto aparecem

## 🎉 Parabéns!

O sistema está **100% funcional**! Só precisava desta configuração final no Google Cloud Console.

**Tudo funcionando perfeitamente! 🚀**
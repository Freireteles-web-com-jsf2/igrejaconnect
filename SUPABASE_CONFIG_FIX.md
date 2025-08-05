# Configuração Correta do Supabase - Correção OAuth

## 🚨 Problema Atual
O Supabase está redirecionando para a URL incorreta:
- **URL Atual (Incorreta)**: `https://freireteles-web-com-jsf2.github.io/auth/callback`
- **URL Correta**: `https://freireteles-web-com-jsf2.github.io/igrejaconnect/auth/callback`

## 🔧 Solução: Configurar no Supabase Dashboard

### 1. Acesse o Supabase Dashboard
- URL: https://supabase.com/dashboard
- Faça login com sua conta
- Selecione o projeto: **pskaimoanrxcsjeaalrz**

### 2. Configure as URLs de Redirecionamento
1. Vá para **Authentication > Settings**
2. Na seção **Site URL**, configure:
   ```
   https://freireteles-web-com-jsf2.github.io/igrejaconnect
   ```

3. Na seção **Redirect URLs**, adicione:
   ```
   https://freireteles-web-com-jsf2.github.io/igrejaconnect/auth/callback
   http://localhost:5173/auth/callback
   ```

### 3. Configurar Google OAuth Provider
1. Vá para **Authentication > Settings > Auth Providers**
2. Configure o **Google Provider**:
   - **Enable Google provider**: ✅ Ativado
   - **Client ID**: (do Google Cloud Console)
   - **Client Secret**: (do Google Cloud Console)
   - **Redirect URL**: `https://pskaimoanrxcsjeaalrz.supabase.co/auth/v1/callback`

### 4. Verificar Google Cloud Console
Certifique-se de que no Google Cloud Console as URLs estão corretas:

**Authorized JavaScript origins:**
```
https://freireteles-web-com-jsf2.github.io
http://localhost:5173
```

**Authorized redirect URIs:**
```
https://pskaimoanrxcsjeaalrz.supabase.co/auth/v1/callback
https://freireteles-web-com-jsf2.github.io/igrejaconnect/auth/callback
http://localhost:5173/auth/callback
```

## 🔄 Solução Temporária (Implementada)

Enquanto a configuração não é corrigida, implementamos:

### 1. Redirecionamento Automático no 404.html
- Detecta URLs de OAuth callback
- Redireciona automaticamente para a URL correta
- Preserva todos os tokens de autenticação

### 2. Código de Detecção
```javascript
// Detecta callback OAuth na URL incorreta
if (l.pathname === '/auth/callback' && l.hash.includes('access_token')) {
  // Redireciona para a URL correta
  l.replace(l.protocol + '//' + l.hostname + '/igrejaconnect/auth/callback' + l.hash);
}
```

## 📋 Checklist de Configuração

- [ ] Site URL configurada no Supabase
- [ ] Redirect URLs configuradas no Supabase
- [ ] Google OAuth provider configurado
- [ ] URLs configuradas no Google Cloud Console
- [ ] Teste realizado com sucesso

## 🎯 Resultado Esperado

Após a configuração correta:
1. **Login com Google** → Funciona normalmente
2. **Redirecionamento** → Vai direto para a URL correta
3. **Processamento** → AuthCallback processa o token
4. **Login completo** → Usuário logado no sistema

## 🔗 Links Importantes

- **Supabase Dashboard**: https://supabase.com/dashboard/project/pskaimoanrxcsjeaalrz
- **Google Cloud Console**: https://console.cloud.google.com/
- **Site do Projeto**: https://freireteles-web-com-jsf2.github.io/igrejaconnect/

## 📞 Status

- ✅ Solução temporária implementada (redirecionamento automático)
- ⏳ Aguardando configuração manual no Supabase Dashboard
- ⏳ Aguardando verificação no Google Cloud Console

**Configure as URLs no Supabase Dashboard para resolver definitivamente o problema!**
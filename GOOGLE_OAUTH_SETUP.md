# Configuração Google OAuth - IgrejaConnect

## 🔧 Configuração no Google Cloud Console

### 1. Acesse o Google Cloud Console
- URL: https://console.cloud.google.com/
- Faça login com sua conta Google

### 2. Selecione ou Crie um Projeto
- Se não tiver um projeto, crie um novo
- Nome sugerido: "IgrejaConnect"

### 3. Ativar a API do Google+
1. Vá para **APIs & Services > Library**
2. Procure por "Google+ API" ou "People API"
3. Clique em **Enable**

### 4. Criar Credenciais OAuth 2.0
1. Vá para **APIs & Services > Credentials**
2. Clique em **+ CREATE CREDENTIALS**
3. Selecione **OAuth 2.0 Client IDs**

### 5. Configurar a Tela de Consentimento
1. Vá para **OAuth consent screen**
2. Selecione **External** (para usuários fora da organização)
3. Preencha os campos obrigatórios:
   - **App name**: IgrejaConnect
   - **User support email**: seu-email@gmail.com
   - **Developer contact information**: seu-email@gmail.com

### 6. Configurar o OAuth Client ID
1. **Application type**: Web application
2. **Name**: IgrejaConnect Web Client
3. **Authorized JavaScript origins**:
   ```
   https://freireteles-web-com-jsf2.github.io
   http://localhost:5173
   ```
4. **Authorized redirect URIs**:
   ```
   https://pskaimoanrxcsjeaalrz.supabase.co/auth/v1/callback
   https://freireteles-web-com-jsf2.github.io/igrejaconnect/auth/callback
   http://localhost:5173/auth/callback
   ```

### 7. Configurar no Supabase
1. Acesse: https://supabase.com/dashboard
2. Vá para seu projeto: **pskaimoanrxcsjeaalrz**
3. Navegue para **Authentication > Settings > Auth Providers**
4. Configure o **Google**:
   - **Enable Google provider**: ✅ Ativado
   - **Client ID**: Cole o Client ID do Google Cloud Console
   - **Client Secret**: Cole o Client Secret do Google Cloud Console
   - **Redirect URL**: `https://pskaimoanrxcsjeaalrz.supabase.co/auth/v1/callback`

### 8. URLs Importantes

#### Produção (GitHub Pages):
- **Site URL**: `https://freireteles-web-com-jsf2.github.io/igrejaconnect`
- **Callback URL**: `https://freireteles-web-com-jsf2.github.io/igrejaconnect/auth/callback`

#### Desenvolvimento:
- **Site URL**: `http://localhost:5173`
- **Callback URL**: `http://localhost:5173/auth/callback`

#### Supabase:
- **Auth Callback**: `https://pskaimoanrxcsjeaalrz.supabase.co/auth/v1/callback`

### 9. Testar a Configuração
1. Acesse o site em produção
2. Clique em "Login com Google"
3. Deve redirecionar para o Google
4. Após autorizar, deve voltar para o site logado

### 🚨 Problemas Comuns

#### Erro: redirect_uri_mismatch
- **Causa**: URL de redirecionamento não configurada no Google Cloud Console
- **Solução**: Adicionar todas as URLs listadas acima nas "Authorized redirect URIs"

#### Erro: ERR_BLOCKED_BY_CLIENT
- **Causa**: Extensão do navegador (AdBlock, etc.) bloqueando
- **Solução**: Desativar extensões ou testar em modo incógnito

#### Erro: access_denied
- **Causa**: Usuário cancelou a autorização ou app não aprovado
- **Solução**: Verificar configuração da tela de consentimento

### 📝 Checklist de Configuração

- [ ] Projeto criado no Google Cloud Console
- [ ] APIs necessárias ativadas
- [ ] Tela de consentimento configurada
- [ ] OAuth Client ID criado
- [ ] JavaScript origins configurados
- [ ] Redirect URIs configurados
- [ ] Supabase configurado com Client ID/Secret
- [ ] Teste realizado em produção
- [ ] Teste realizado em desenvolvimento

### 🔗 Links Úteis
- [Google Cloud Console](https://console.cloud.google.com/)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Documentação Supabase Auth](https://supabase.com/docs/guides/auth/social-login/auth-google)
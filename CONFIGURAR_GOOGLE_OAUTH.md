# 🔐 Configurar Google OAuth para Supabase

## 📋 Passo a Passo Completo

### 1. Configurar Google Cloud Console

#### 1.1 Criar/Acessar Projeto
1. Acesse: https://console.cloud.google.com
2. Crie um novo projeto ou selecione um existente
3. Anote o **Project ID**

#### 1.2 Ativar APIs Necessárias
1. Vá para **APIs & Services** > **Library**
2. Procure e ative:
   - **Google+ API** (ou **People API**)
   - **Google Identity and Access Management (IAM) API**

#### 1.3 Criar Credenciais OAuth 2.0
1. Vá para **APIs & Services** > **Credentials**
2. Clique em **+ CREATE CREDENTIALS** > **OAuth client ID**
3. Selecione **Web application**
4. Configure:

**Nome**: `IgrejaConnect`

**Authorized JavaScript origins**:
```
http://localhost:5173
https://seu-dominio.com
```

**Authorized redirect URIs**:
```
https://pskaimoanrxcsjeaalrz.supabase.co/auth/v1/callback
```

5. Clique em **CREATE**
6. **COPIE** o **Client ID** e **Client Secret**

### 2. Configurar Supabase

#### 2.1 Executar Script SQL
1. Acesse: https://supabase.com/dashboard/project/pskaimoanrxcsjeaalrz
2. Vá para **SQL Editor**
3. Cole todo o conteúdo do arquivo `supabase-setup.sql`
4. Clique em **RUN**

#### 2.2 Configurar Google OAuth
1. Vá para **Authentication** > **Settings**
2. Na seção **Auth Providers**, encontre **Google**
3. Ative o toggle **Enable sign in with Google**
4. Configure:

**Client ID (for OAuth)**:
```
cole_seu_client_id_aqui
```

**Client Secret (for OAuth)**:
```
cole_seu_client_secret_aqui
```

5. Clique em **Save**

### 3. Testar a Configuração

#### 3.1 Executar o Sistema
```bash
npm run dev
```

#### 3.2 Testar Login
1. Acesse: http://localhost:5173/login
2. Clique em **"Entrar com Google"**
3. Deve abrir popup/redirect do Google
4. Autorize a aplicação
5. Deve ser redirecionado para o dashboard

#### 3.3 Verificar Dados
1. Clique no avatar no header
2. Selecione **"Ver Perfil"**
3. Verifique se os dados foram sincronizados:
   - Nome do Google
   - Email
   - Foto do perfil
   - Papel: "Administrador" (para lucianofreireteles@gmail.com)

### 4. Configurar Domínio de Produção

Quando fizer deploy, adicione seu domínio:

#### 4.1 Google Cloud Console
Adicione em **Authorized JavaScript origins**:
```
https://seu-dominio.com
```

#### 4.2 Supabase
O redirect URI já está configurado corretamente.

## 🔍 Troubleshooting

### Erro: "redirect_uri_mismatch"
- Verifique se a URL de redirect no Google Cloud Console está exata:
  `https://pskaimoanrxcsjeaalrz.supabase.co/auth/v1/callback`

### Erro: "access_denied"
- Verifique se as APIs estão ativadas no Google Cloud Console
- Confirme se o Client ID e Secret estão corretos no Supabase

### Erro: "Invalid login credentials"
- Execute o script SQL completo no Supabase
- Verifique se as tabelas foram criadas
- Confirme se o trigger `handle_new_user()` está ativo

### Login funciona mas dados não aparecem
- Verifique se a função `handle_new_user()` foi criada
- Confirme se o trigger está executando
- Verifique a tabela `church_users` no Supabase

## ✅ Checklist Final

- [ ] Google Cloud Console configurado
- [ ] APIs ativadas (Google+ API)
- [ ] Credenciais OAuth criadas
- [ ] Client ID e Secret copiados
- [ ] Script SQL executado no Supabase
- [ ] Google OAuth ativado no Supabase
- [ ] Client ID e Secret configurados no Supabase
- [ ] Teste de login realizado com sucesso
- [ ] Dados do usuário sincronizados

## 🎉 Resultado Esperado

Após a configuração completa:

1. **Login funciona** - Popup/redirect do Google abre
2. **Autorização** - Usuário autoriza a aplicação
3. **Redirecionamento** - Volta para o dashboard
4. **Sincronização** - Dados do Google aparecem no perfil
5. **Permissões** - Sistema de papéis funcionando

**Tudo pronto para usar! 🚀**
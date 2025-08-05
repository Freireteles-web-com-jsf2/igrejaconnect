# Configuração Manual do GitHub Pages

## 🚨 Problema Atual
O GitHub Pages não está configurado para o repositório, causando erro 404 na rota `/auth/callback`.

## 🔧 Solução Manual

### 1. Configurar GitHub Pages
1. Acesse: https://github.com/Freireteles-web-com-jsf2/igrejaconnect
2. Vá para **Settings** (aba do repositório)
3. Role para baixo até **Pages** (menu lateral esquerdo)
4. Em **Source**, selecione **GitHub Actions**
5. Salve as configurações

### 2. Verificar Secrets
1. Ainda em **Settings**, vá para **Secrets and variables > Actions**
2. Verifique se existem as secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Se não existirem, adicione:
   - `VITE_SUPABASE_URL`: `https://pskaimoanrxcsjeaalrz.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBza2FpbW9hbnJ4Y3NqZWFhbHJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MTIwMjgsImV4cCI6MjA2ODE4ODAyOH0.yQtaXz0Ss854-X47rAM-kMzCdyWdIFf-VE744U3tcYU`

### 3. Forçar Deploy
1. Vá para **Actions** (aba do repositório)
2. Clique em **GitHub Pages Deploy v2**
3. Clique em **Run workflow** > **Run workflow**

### 4. Aguardar Deploy
- O deploy leva cerca de 2-5 minutos
- Acompanhe o progresso na aba **Actions**
- Quando concluído, o site estará em: https://freireteles-web-com-jsf2.github.io/igrejaconnect/

## 🔄 Solução Alternativa (Temporária)

Enquanto o GitHub Pages não está configurado, você pode:

1. **Testar localmente**:
   ```bash
   npm run dev
   ```
   - Acesse: http://localhost:5173
   - O OAuth funcionará normalmente

2. **Usar URL de fallback**:
   - Se o callback falhar, será redirecionado para `/auth/fallback`
   - Esta página tentará processar a autenticação manualmente

## 📋 Checklist

- [ ] GitHub Pages configurado (Source: GitHub Actions)
- [ ] Secrets configuradas
- [ ] Deploy executado com sucesso
- [ ] Site acessível em https://freireteles-web-com-jsf2.github.io/igrejaconnect/
- [ ] OAuth funcionando corretamente

## 🆘 Se Ainda Não Funcionar

1. **Verificar logs do GitHub Actions**
2. **Testar em modo incógnito** (para evitar cache)
3. **Verificar se o domínio está correto** no Google Cloud Console
4. **Usar desenvolvimento local** como alternativa

## 🔗 Links Importantes

- **Repositório**: https://github.com/Freireteles-web-com-jsf2/igrejaconnect
- **GitHub Actions**: https://github.com/Freireteles-web-com-jsf2/igrejaconnect/actions
- **Site (após configuração)**: https://freireteles-web-com-jsf2.github.io/igrejaconnect/
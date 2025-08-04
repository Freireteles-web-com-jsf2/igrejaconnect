# 🚀 Deploy no Vercel - IgrejaConnect

## 📋 **Pré-requisitos:**
1. ✅ Conta no Vercel (https://vercel.com)
2. ✅ Projeto commitado no GitHub
3. ✅ Variáveis de ambiente do Supabase

## 🔧 **Configuração Realizada:**

### **1. Arquivos Criados:**
- ✅ `vercel.json` - Configuração do deploy
- ✅ `api/index.js` - Handler da API para Vercel
- ✅ Script `vercel-build` no package.json

### **2. Estrutura do Deploy:**
```
dist/client/     → Frontend React (estático)
api/index.js     → API handler (limitado)
vercel.json      → Configuração do Vercel
```

## 🚀 **Como Fazer o Deploy:**

### **Opção 1: Via Interface Web do Vercel**
1. **Acesse**: https://vercel.com/dashboard
2. **Clique**: "New Project"
3. **Conecte**: Seu repositório GitHub
4. **Configure** as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. **Deploy**: Clique em "Deploy"

### **Opção 2: Via CLI do Vercel**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel

# Configurar variáveis de ambiente
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Deploy em produção
vercel --prod
```

## ⚠️ **Limitações do Deploy no Vercel:**

### **🔴 Backend Limitado:**
- O Vercel é otimizado para sites estáticos
- O backend Hono/Cloudflare Workers não funciona completamente
- APIs complexas podem não funcionar

### **✅ O que Funciona:**
- ✅ Frontend React completo
- ✅ Interface de usuário
- ✅ Roteamento do React Router
- ✅ Estilos Tailwind CSS
- ✅ Componentes e páginas

### **❌ O que NÃO Funciona:**
- ❌ APIs do backend (CRUD de membros, eventos, etc.)
- ❌ Autenticação completa
- ❌ Operações no banco de dados
- ❌ Sistema de permissões no backend

## 🎯 **Recomendação:**

### **Para Deploy Completo:**
**Use Cloudflare Pages + Workers** (configuração original):
```bash
# Deploy no Cloudflare
npm run check
wrangler deploy
```

### **Para Demo/Preview:**
**Use Vercel** para mostrar a interface:
- Perfeito para demonstrações visuais
- Mostra o design e UX
- Não requer backend funcional

## 🔧 **Configuração das Variáveis no Vercel:**

### **Via Dashboard:**
1. Vá para: Project Settings → Environment Variables
2. Adicione:
   ```
   VITE_SUPABASE_URL = sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY = sua_chave_anonima
   SUPABASE_SERVICE_ROLE_KEY = sua_chave_de_servico
   ```

### **Via CLI:**
```bash
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

## 📱 **Resultado Esperado:**
- **URL**: https://seu-projeto.vercel.app
- **Frontend**: Funcionando 100%
- **Backend**: Limitado (apenas endpoints básicos)
- **Banco**: Não conectado (requer Cloudflare Workers)

## 🚀 **Próximos Passos Após Deploy:**
1. **Teste a interface** no Vercel
2. **Configure domínio customizado** (se necessário)
3. **Para funcionalidade completa**: Use Cloudflare Pages + Workers

**O deploy no Vercel é ideal para demonstrações e previews da interface, mas para funcionalidade completa, recomenda-se Cloudflare Workers.** 🚀✅
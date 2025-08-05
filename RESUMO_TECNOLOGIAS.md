# Resumo das Tecnologias - IgrejaConnect

## 🎯 **Frontend**
- **React 19** - Framework principal para interface
- **TypeScript** - Tipagem estática para maior segurança
- **Tailwind CSS** - Framework CSS utilitário para estilização
- **React Router 7.5.3** - Roteamento SPA
- **Lucide React** - Biblioteca de ícones
- **Recharts** - Gráficos e visualizações
- **Vite 6.3.2** - Build tool e dev server

## 🔧 **Backend & API**
- **Hono 4.7.7** - Framework web minimalista
- **Cloudflare Workers** - Serverless runtime
- **Supabase** - Backend-as-a-Service (BaaS)
- **PostgreSQL** - Banco de dados (via Supabase)
- **Zod** - Validação de schemas

## 🔐 **Autenticação**
- **Google OAuth 2.0** - Login social
- **Supabase Auth** - Gerenciamento de autenticação
- **Row Level Security (RLS)** - Segurança a nível de linha

## 📊 **Funcionalidades**
- **Sistema de Permissões** - Controle granular de acesso
- **Gestão de Membros** - CRUD completo
- **Controle Financeiro** - Receitas e despesas
- **Dashboard** - Métricas e relatórios
- **Notificações** - Sistema de comunicação interna
- **Exportação** - PDF (jsPDF) e Excel (XLSX)

## 🚀 **Deploy no GitHub Pages**

### **Configuração Automática:**

#### 1. **Workflow GitHub Actions** (`.github/workflows/github-pages.yml`):
- Trigger automático no push para `main`
- Build com Node.js 18
- Deploy usando `peaceiris/actions-gh-pages@v3`

#### 2. **Configuração Específica:**
- **Base Path**: `/igrejaconnect/` (configurado no `vite.config.gh-pages.js`)
- **Package Limpo**: `package.gh-pages.json` (sem dependências Cloudflare)
- **Build Command**: `NODE_ENV=production vite build --config vite.config.gh-pages.js`

#### 3. **Secrets Necessários:**
- `VITE_SUPABASE_URL` - URL do projeto Supabase
- `VITE_SUPABASE_ANON_KEY` - Chave anônima do Supabase
- `PAT_TOKEN` (opcional) - Token pessoal para deploy

### **Processo de Deploy:**
1. Push para branch `main`
2. GitHub Actions instala dependências limpas
3. Compila TypeScript
4. Build otimizado para produção
5. Deploy automático para GitHub Pages
6. Site disponível em: `https://usuario.github.io/igrejaconnect/`

## 🛠 **Ferramentas de Desenvolvimento**
- **ESLint** - Linting de código
- **PostCSS** - Processamento CSS
- **Autoprefixer** - Prefixos CSS automáticos

## 🌐 **Alternativas de Deploy**
- **Cloudflare Pages + Workers** (configuração principal)
- **Vercel** (configuração alternativa)
- **GitHub Pages** (configuração simplificada)

## 📋 **Estrutura do Banco de Dados**

### **Tabelas Principais:**
- `church_users` - Usuários do sistema com dados estendidos
- `members` - Membros da igreja
- `departments` - Departamentos/ministérios
- `financial_transactions` - Transações financeiras
- `notifications` - Notificações do sistema
- `permissions` - Permissões disponíveis
- `custom_roles` - Papéis personalizados
- `role_permissions` - Relacionamento entre papéis e permissões

### **Sistema de Permissões:**
- **Administrador** - Acesso total ao sistema
- **Pastor** - Acesso a membros e notificações, visualização financeira
- **Líder** - Acesso a membros e criação de notificações
- **Tesoureiro** - Acesso total ao módulo financeiro e visualização de membros
- **Voluntário** - Acesso básico a membros e dashboard
- **Membro** - Acesso apenas ao dashboard

## 🔒 **Segurança**
- Autenticação OAuth 2.0 com Google
- Tokens de sessão seguros (httpOnly cookies)
- Sistema de permissões granulares
- Middleware de autenticação em todas as rotas
- Validação de dados com Zod
- Row Level Security (RLS) no banco de dados

## 📱 **Interface**
- Design moderno e responsivo
- Componentes acessíveis
- Estados de loading e erro
- Notificações em tempo real
- Tema consistente com Tailwind CSS

## 🔄 **Sincronização**
- Sincronização automática no login
- Sincronização manual via interface
- Preservação de dados específicos da igreja
- Notificações de status de sincronização

---

**Conclusão:** O projeto está bem estruturado com múltiplas opções de deploy e uma arquitetura moderna que combina React no frontend com Supabase como backend, oferecendo uma solução completa para gestão de igrejas.
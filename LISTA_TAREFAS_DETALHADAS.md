# 📋 Lista de Tarefas Detalhadas - IgrejaConnect

## 🎯 **TAREFAS IMEDIATAS (Esta Semana)**

### 📅 **TAREFA 1: Sistema de Eventos (Prioridade MÁXIMA)**

#### **Backend - Estrutura do Banco (2 horas)**
- [ ] **1.1** Criar migration para tabela `events`
  - Arquivo: `migrations/5.sql`
  - Campos: id, title, description, event_type, start_datetime, end_datetime, location, max_participants, requires_confirmation, department_id, created_by, is_active
  - Índices: start_datetime, event_type, department_id

- [ ] **1.2** Criar migration para tabela `event_participants`
  - Relacionamento com events e members
  - Status de participação
  - Data de inscrição

- [ ] **1.3** Executar migrations no Supabase
  - Testar estrutura no SQL Editor
  - Verificar relacionamentos

#### **Backend - APIs (4 horas)**
- [ ] **1.4** Implementar schema Zod para eventos
  ```typescript
  const EventSchema = z.object({
    title: z.string().min(3).max(100),
    description: z.string().max(500).optional(),
    event_type: z.enum(['culto', 'reuniao', 'evento_especial']),
    start_datetime: z.string().datetime(),
    end_datetime: z.string().datetime().optional(),
    location: z.string().max(200).optional(),
    max_participants: z.number().positive().optional(),
    requires_confirmation: z.boolean().default(false),
    department_id: z.number().positive().optional()
  });
  ```

- [ ] **1.5** Implementar endpoints CRUD
  - `GET /api/events` - Listar com filtros
  - `POST /api/events` - Criar evento
  - `PUT /api/events/:id` - Editar evento
  - `DELETE /api/events/:id` - Excluir evento

- [ ] **1.6** Implementar endpoints de participação
  - `GET /api/events/:id/participants` - Listar participantes
  - `POST /api/events/:id/participants` - Inscrever
  - `DELETE /api/events/:id/participants/:memberId` - Cancelar

#### **Frontend - Interface (6 horas)**
- [ ] **1.7** Criar página `/events`
  - Arquivo: `src/react-app/pages/Events.tsx`
  - Lista de eventos com cards
  - Filtros por tipo e data
  - Botão "Novo Evento"

- [ ] **1.8** Criar modal de evento
  - Formulário completo
  - Seleção de departamento
  - Validação de datas
  - Upload de imagem (opcional)

- [ ] **1.9** Implementar visualização de detalhes
  - Modal de detalhes do evento
  - Lista de participantes
  - Botão de inscrição

- [ ] **1.10** Integrar no menu principal
  - Adicionar link no Layout
  - Ícone de calendário
  - Badge de eventos próximos

#### **Frontend - Calendário (4 horas)**
- [ ] **1.11** Instalar react-big-calendar
  ```bash
  npm install react-big-calendar moment
  npm install @types/react-big-calendar
  ```

- [ ] **1.12** Criar componente Calendar
  - Arquivo: `src/react-app/components/Calendar.tsx`
  - Visualização mensal
  - Eventos coloridos por tipo
  - Click para detalhes

- [ ] **1.13** Integrar calendário na página
  - Aba "Lista" e "Calendário"
  - Navegação entre meses
  - Responsividade mobile

---

### 📊 **TAREFA 2: Relatórios em PDF (Prioridade ALTA)**

#### **Backend - APIs de Relatório (3 horas)**
- [ ] **2.1** Implementar endpoint de relatório de membros
  ```typescript
  app.get('/api/reports/members', async (c) => {
    // Filtros: ativo/inativo, departamento, faixa etária
    // Dados: nome, email, telefone, departamento, data nascimento
  });
  ```

- [ ] **2.2** Implementar endpoint de relatório financeiro
  ```typescript
  app.get('/api/reports/financial', async (c) => {
    // Filtros: período, tipo, categoria
    // Dados: transações, totais, gráficos
  });
  ```

- [ ] **2.3** Implementar endpoint de relatório de departamentos
  ```typescript
  app.get('/api/reports/departments', async (c) => {
    // Dados: departamentos, líderes, membros, reuniões
  });
  ```

#### **Frontend - Geração de PDF (4 horas)**
- [ ] **2.4** Instalar bibliotecas
  ```bash
  npm install jspdf html2canvas
  npm install xlsx
  ```

- [ ] **2.5** Criar página `/reports`
  - Arquivo: `src/react-app/pages/Reports.tsx`
  - Seleção de tipo de relatório
  - Filtros de data
  - Preview do relatório

- [ ] **2.6** Implementar templates de PDF
  - Template de membros com logo da igreja
  - Template financeiro com gráficos
  - Template de departamentos

- [ ] **2.7** Implementar exportação Excel
  - Mesmos dados em formato planilha
  - Formatação profissional
  - Múltiplas abas se necessário

---

### ⚙️ **TAREFA 3: Configurações da Igreja (Prioridade ALTA)**

#### **Backend - Configurações (2 horas)**
- [ ] **3.1** Criar tabela church_settings
  - Migration com campos básicos
  - Configurações padrão
  - Validações

- [ ] **3.2** Implementar APIs
  ```typescript
  app.get('/api/settings', async (c) => {
    // Retornar configurações atuais
  });
  
  app.put('/api/settings', async (c) => {
    // Atualizar configurações
  });
  ```

#### **Frontend - Interface (3 horas)**
- [ ] **3.3** Criar página `/settings`
  - Formulário de dados da igreja
  - Upload de logo
  - Seletor de cores primária/secundária
  - Configurações de timezone

- [ ] **3.4** Implementar upload de logo
  - Integração com Supabase Storage
  - Preview da imagem
  - Redimensionamento automático

- [ ] **3.5** Aplicar configurações no sistema
  - Logo no header
  - Cores personalizadas
  - Nome da igreja no título

---

## 🎯 **TAREFAS PARA PRÓXIMA SEMANA**

### 💬 **TAREFA 4: Sistema de Comunicação**

#### **Subtarefas:**
- [ ] **4.1** Criar tabela announcements (1h)
- [ ] **4.2** Implementar APIs de avisos (2h)
- [ ] **4.3** Criar página de comunicação (3h)
- [ ] **4.4** Integrar avisos no dashboard (2h)
- [ ] **4.5** Sistema de notificações push (4h)

### 👥 **TAREFA 5: Gestão Avançada de Usuários**

#### **Subtarefas:**
- [ ] **5.1** Melhorar página de usuários (3h)
- [ ] **5.2** Sistema de log de atividades (2h)
- [ ] **5.3** Interface de permissões granulares (4h)
- [ ] **5.4** Histórico de ações do usuário (3h)

### 🚀 **TAREFA 6: Otimização de Performance**

#### **Subtarefas:**
- [ ] **6.1** Implementar paginação (2h)
- [ ] **6.2** Adicionar índices no banco (1h)
- [ ] **6.3** Cache de dados frequentes (3h)
- [ ] **6.4** Lazy loading de componentes (2h)
- [ ] **6.5** Otimização de imagens (2h)

---

## 📱 **TAREFAS FUTURAS (Próximo Mês)**

### **TAREFA 7: Mobile App (React Native)**
- [ ] **7.1** Setup do projeto React Native
- [ ] **7.2** Autenticação mobile
- [ ] **7.3** Telas principais (Dashboard, Membros, Eventos)
- [ ] **7.4** Push notifications
- [ ] **7.5** Deploy nas stores

### **TAREFA 8: Integrações Externas**
- [ ] **8.1** Integração WhatsApp Business API
- [ ] **8.2** Envio de emails (SendGrid/Mailgun)
- [ ] **8.3** Integração com Google Calendar
- [ ] **8.4** API de CEP para endereços
- [ ] **8.5** Gateway de pagamento (Stripe/PagSeguro)

### **TAREFA 9: IA e Analytics**
- [ ] **9.1** Dashboard de analytics
- [ ] **9.2** Insights automáticos
- [ ] **9.3** Previsões de crescimento
- [ ] **9.4** Recomendações personalizadas
- [ ] **9.5** Chatbot para suporte

---

## 🛠️ **FERRAMENTAS E COMANDOS ÚTEIS**

### **Para Desenvolvimento:**
```bash
# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Deploy
wrangler deploy

# Verificar tipos
npm run check

# Executar migrations
# (executar no SQL Editor do Supabase)
```

### **Para Testes:**
```bash
# Testar APIs
curl -H "Authorization: Bearer TOKEN" http://localhost:5173/api/events

# Verificar banco
# Acessar https://supabase.com/dashboard/project/pskaimoanrxcsjeaalrz/editor
```

### **Para Monitoramento:**
```bash
# Ver logs
wrangler tail

# Verificar performance
npm run analyze

# Testar responsividade
# Chrome DevTools > Device Mode
```

---

## 📊 **CHECKLIST DE QUALIDADE**

### **Antes de Cada Deploy:**
- [ ] ✅ Todos os testes passando
- [ ] ✅ Build sem erros
- [ ] ✅ Responsividade testada
- [ ] ✅ Performance verificada
- [ ] ✅ Segurança auditada
- [ ] ✅ Backup do banco realizado

### **Antes de Cada Feature:**
- [ ] ✅ Schema do banco definido
- [ ] ✅ APIs documentadas
- [ ] ✅ Validações implementadas
- [ ] ✅ Interface mockada
- [ ] ✅ Testes unitários escritos

### **Critérios de Aceitação:**
- [ ] ✅ Funcionalidade completa
- [ ] ✅ Interface intuitiva
- [ ] ✅ Performance adequada
- [ ] ✅ Segurança garantida
- [ ] ✅ Documentação atualizada

---

## 🎯 **METAS SEMANAIS**

### **Semana 1 (Esta Semana):**
- ✅ Sistema de Eventos 100% funcional
- ✅ Relatórios em PDF implementados
- ✅ Configurações básicas da igreja

### **Semana 2:**
- ✅ Sistema de comunicação completo
- ✅ Gestão avançada de usuários
- ✅ Performance otimizada

### **Semana 3:**
- ✅ Mobile responsivo perfeito
- ✅ Segurança auditada
- ✅ Backup/restore funcionando

### **Semana 4:**
- ✅ Deploy em produção
- ✅ Documentação completa
- ✅ Sistema pronto para comercialização

---

## 🚀 **PRÓXIMA AÇÃO IMEDIATA**

**COMEÇAR AGORA:**
1. **Criar migration para eventos** (`migrations/5.sql`)
2. **Implementar APIs básicas de eventos**
3. **Criar página `/events` com lista básica**

**Tempo estimado para primeira versão funcional: 4-6 horas**

**Meta do dia: Sistema de eventos básico funcionando! 🎯**
# 🧪 Testar Sistema de Eventos - Diagnóstico Completo

## 🎯 **Objetivo**
Verificar se o sistema de eventos está funcionando corretamente com dados reais do Supabase.

## ✅ **Correções Implementadas**

### **1. APIs Corrigidas**
- ✅ **GET /api/events** - Corrigida para funcionar sem foreign keys
- ✅ **GET /api/events/:id** - Corrigida para buscar dados relacionados separadamente
- ✅ Removidas dependências de JOINs que causavam erros

### **2. Página de Teste Criada**
- ✅ **Nova página:** `/events-test` 
- ✅ Diagnóstico completo da API
- ✅ Teste direto sem cache
- ✅ Visualização de dados raw

### **3. Debug Adicionado**
- ✅ Console logs na página principal
- ✅ Indicadores visuais de status
- ✅ Informações detalhadas de erro

## 🚀 **Como Testar**

### **Passo 1: Executar Migration (se ainda não fez)**
1. Acesse: https://supabase.com/dashboard/project/pskaimoanrxcsjeaalrz
2. Vá para **SQL Editor**
3. Execute o código de `ATIVAR_SISTEMA_EVENTOS.md`

### **Passo 2: Iniciar o Sistema**
```bash
npm run dev
```

### **Passo 3: Testar as Páginas**

#### **A) Página de Teste (Recomendado)**
- Acesse: http://localhost:5173/events-test
- Clique em "Testar API" 
- Verifique se os dados aparecem

#### **B) Página Principal**
- Acesse: http://localhost:5173/events
- Verifique o painel de debug amarelo
- Veja se os eventos aparecem na lista

#### **C) Dashboard**
- Acesse: http://localhost:5173/
- Clique no botão "Eventos"
- Deve redirecionar para a página de eventos

## 🔍 **O que Verificar**

### **✅ Cenário de Sucesso:**
- ✅ API retorna dados sem erro
- ✅ Lista de eventos aparece
- ✅ Botões funcionam (Novo Evento, Editar, Excluir)
- ✅ Filtros e busca funcionam

### **❌ Possíveis Problemas:**

#### **1. Erro 401 (Não Autorizado)**
- **Causa:** Token de autenticação inválido
- **Solução:** Fazer logout e login novamente

#### **2. Erro 500 (Servidor)**
- **Causa:** Tabelas não criadas no Supabase
- **Solução:** Executar a migration novamente

#### **3. Dados Vazios**
- **Causa:** Migration não inseriu eventos de exemplo
- **Solução:** Inserir dados manualmente ou reexecutar migration

#### **4. Erro de CORS**
- **Causa:** Configuração do worker
- **Solução:** Verificar se o servidor está rodando

## 🛠️ **Soluções Rápidas**

### **Se a API não funcionar:**
```sql
-- Execute no Supabase SQL Editor para verificar se as tabelas existem
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('events', 'event_participants');

-- Se não existirem, execute a migration novamente
```

### **Se não houver dados:**
```sql
-- Inserir eventos de teste manualmente
INSERT INTO events (title, description, event_type, start_datetime, location, created_by) VALUES
('Teste de Evento', 'Evento criado para teste', 'culto', NOW() + INTERVAL '1 day', 'Local de Teste', 1);
```

### **Se houver erro de autenticação:**
1. Abra o DevTools (F12)
2. Vá para Application > Storage
3. Limpe os dados do Supabase
4. Faça login novamente

## 📊 **Resultados Esperados**

### **Na Página de Teste (/events-test):**
- ✅ Status "Concluído" no hook useApi
- ✅ "Sem erros" na seção de erro
- ✅ "X eventos" na seção de dados
- ✅ JSON com dados dos eventos
- ✅ Lista visual dos eventos

### **Na Página Principal (/events):**
- ✅ Debug mostra dados carregados
- ✅ Lista de eventos aparece
- ✅ Botão "Novo Evento" funciona
- ✅ Filtros e busca funcionam

## 🎉 **Próximos Passos**

### **Se Tudo Funcionar:**
1. Remover o debug da página principal
2. Testar criação de novos eventos
3. Testar edição e exclusão
4. Implementar próxima funcionalidade

### **Se Houver Problemas:**
1. Verificar logs no console do navegador
2. Verificar logs do servidor (`wrangler tail`)
3. Testar APIs diretamente no Postman/Insomnia
4. Verificar configuração do Supabase

## 🔧 **Comandos Úteis**

```bash
# Ver logs do servidor
wrangler tail

# Limpar cache
rm -rf node_modules/.vite
npm run dev

# Verificar build
npm run build
```

**Tempo estimado para teste: 5-10 minutos**

**Meta: Confirmar que o sistema de eventos está 100% funcional! 🎯**
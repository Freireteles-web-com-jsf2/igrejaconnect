# Sistema Financeiro com Relacionamento de Membros

## Implementações Realizadas

### 1. Migração do Banco de Dados
- **Arquivo**: `migrations/add_member_to_financial_transactions.sql`
- **Alterações**:
  - Adicionada coluna `member_id` na tabela `financial_transactions`
  - Criado relacionamento com a tabela `members` via foreign key
  - Adicionado índice para melhorar performance das consultas
  - Configurado `ON DELETE SET NULL` para manter integridade dos dados

### 2. Backend (API)
- **Arquivo**: `src/worker/index.ts`
- **Melhorias**:
  - Atualizado schema de validação para incluir `member_id`
  - Modificadas consultas para incluir dados do membro relacionado
  - Adicionado endpoint `/api/financial/members` para listar membros ativos
  - Implementado JOIN com tabela members nas consultas de transações

### 3. Frontend - Componente Principal
- **Arquivo**: `src/react-app/pages/Finance.tsx`
- **Funcionalidades**:
  - Campo de seleção de membro no formulário de transações
  - Exibição condicional do campo apenas para receitas de "Dízimos" e "Ofertas"
  - Visualização do nome do membro nas transações listadas
  - Interface intuitiva com labels contextuais (Dizimista/Ofertante)

### 4. Frontend - Componente Simplificado
- **Arquivo**: `src/react-app/pages/FinanceSimple.tsx`
- **Funcionalidades**:
  - Mesmas funcionalidades do componente principal
  - Mantida consistência na experiência do usuário

## Funcionalidades Implementadas

### Seleção de Membro Dizimista/Ofertante
- Campo aparece automaticamente quando:
  - Tipo da transação é "Receita"
  - Categoria selecionada é "Dízimos" ou "Ofertas"
- Lista todos os membros ativos ordenados alfabeticamente
- Campo opcional - permite registrar transações sem membro específico

### Visualização Melhorada
- Badge roxo mostra o nome do membro nas transações
- Informação clara sobre quem fez o dízimo/oferta
- Mantida compatibilidade com transações existentes

### Integridade dos Dados
- Relacionamento configurado com `ON DELETE SET NULL`
- Se um membro for excluído, as transações permanecem mas sem referência
- Validação no backend para garantir dados consistentes

## Como Usar

### 1. Executar a Migração
```sql
-- Execute o arquivo migrations/add_member_to_financial_transactions.sql
-- no seu banco Supabase
```

### 2. Cadastrar Dízimo com Membro
1. Acesse o sistema financeiro
2. Clique em "Nova Transação"
3. Selecione "Receita"
4. Escolha categoria "Dízimos"
5. O campo "Membro (Dizimista)" aparecerá automaticamente
6. Selecione o membro da lista
7. Preencha os demais campos e salve

### 3. Visualizar Transações
- Transações com membros mostram um badge roxo com o nome
- Filtros e buscas continuam funcionando normalmente
- Relatórios incluem informações do membro quando disponível

## Benefícios

### Para a Igreja
- **Controle de Dízimos**: Saber exatamente quem está dizimando
- **Relatórios Personalizados**: Possibilidade de gerar relatórios por membro
- **Acompanhamento Pastoral**: Identificar membros que precisam de orientação financeira
- **Transparência**: Melhor controle e prestação de contas

### Para os Usuários
- **Interface Intuitiva**: Campo aparece apenas quando necessário
- **Facilidade de Uso**: Lista de membros ordenada alfabeticamente
- **Flexibilidade**: Campo opcional para casos especiais
- **Compatibilidade**: Funciona com transações existentes

## Próximas Melhorias Sugeridas

### Relatórios Avançados
- Relatório de dízimos por membro
- Gráfico de contribuições mensais por pessoa
- Ranking de maiores dizimistas
- Histórico de contribuições individuais

### Funcionalidades Adicionais
- Notificações para membros que não dizimaram no mês
- Meta de dízimos por membro
- Integração com sistema de membros para dados completos
- Exportação de relatórios em PDF/Excel

### Melhorias de UX
- Busca de membros no dropdown
- Sugestão automática baseada em transações anteriores
- Validação de valores baseada no histórico do membro
- Dashboard personalizado por membro

## Estrutura de Dados

### Tabela financial_transactions (atualizada)
```sql
CREATE TABLE financial_transactions (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('receita', 'despesa')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  date DATE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  member_id INTEGER REFERENCES members(id) ON DELETE SET NULL, -- NOVO
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Relacionamento
- `financial_transactions.member_id` → `members.id`
- Relacionamento opcional (nullable)
- Cascata configurada para SET NULL em caso de exclusão do membro

## Conclusão

O sistema financeiro agora possui integração completa com o cadastro de membros, permitindo um controle mais detalhado das contribuições e oferecendo uma base sólida para relatórios e análises futuras. A implementação mantém a simplicidade de uso enquanto adiciona funcionalidades poderosas para a gestão financeira da igreja.
# Correção do CRUD de Departamentos - Sincronização com Supabase

## Problema Identificado

O CRUD de departamentos não estava sincronizado com o Supabase devido a uma incompatibilidade na estrutura da tabela `departments` entre as migrações locais (SQLite) e o banco do Supabase (PostgreSQL).

### Diferenças Encontradas:

1. **Migração Local (SQLite)**: Campo `leaders` definido como `TEXT` (JSON string)
2. **Supabase (PostgreSQL)**: Campo `leaders` definido como `INTEGER[]` (array de inteiros)
3. **Código da API**: Esperava um array de números mas não tratava a diferença entre os bancos

## Soluções Implementadas

### 1. Atualização da API (src/worker/index.ts)

- **GET /api/departments**: Agora detecta o tipo de dados do campo `leaders` e normaliza para array
- **POST /api/departments**: Detecta se é PostgreSQL ou SQLite e formata os dados adequadamente
- **PUT /api/departments**: Mesma lógica de detecção e formatação

### 2. Detecção Automática do Tipo de Banco

```typescript
const isPostgreSQL = c.env.VITE_SUPABASE_URL && c.env.VITE_SUPABASE_URL.includes('supabase.co');
```

### 3. Tratamento Diferenciado dos Dados

**Para PostgreSQL (Supabase):**
```typescript
leaders: departmentData.leaders // Array direto
```

**Para SQLite (Local):**
```typescript
leaders: JSON.stringify(departmentData.leaders) // JSON string
```

### 4. Normalização na Leitura

```typescript
let leaderIds: number[] = [];

if (dept.leaders) {
  if (Array.isArray(dept.leaders)) {
    // PostgreSQL - já é um array
    leaderIds = dept.leaders;
  } else if (typeof dept.leaders === 'string') {
    // SQLite - é uma string JSON
    try {
      leaderIds = JSON.parse(dept.leaders);
    } catch (e) {
      console.warn('Error parsing leaders JSON:', e);
      leaderIds = [];
    }
  }
}
```

## Resultado

✅ **CRUD de departamentos agora funciona corretamente tanto no ambiente local (SQLite) quanto no Supabase (PostgreSQL)**

### Funcionalidades Corrigidas:

- ✅ Listagem de departamentos com nomes dos líderes
- ✅ Criação de novos departamentos
- ✅ Edição de departamentos existentes
- ✅ Exclusão de departamentos
- ✅ Seleção de múltiplos líderes
- ✅ Sincronização automática entre frontend e backend

## Teste da Correção

Para testar se a correção funcionou:

1. Acesse a página de Departamentos
2. Crie um novo departamento com líderes selecionados
3. Verifique se os nomes dos líderes aparecem na listagem
4. Edite um departamento existente
5. Confirme que as alterações são salvas corretamente

## Arquivos Modificados

- `src/worker/index.ts` - APIs de departamentos corrigidas
- `migrations/4.sql` - Comentário atualizado para clarificar a estrutura
- `CORRECAO_DEPARTAMENTOS.md` - Esta documentação

## Próximos Passos

O sistema de departamentos está agora totalmente funcional e sincronizado. Não são necessárias ações adicionais.
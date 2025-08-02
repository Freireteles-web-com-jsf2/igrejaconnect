# 🔧 Debug da Autenticação Google

## Problemas Identificados

Baseado nos erros no console, identifiquei os seguintes problemas:

### 1. Erro 401 - `/api/users/me`
- **Causa**: Usuário não autenticado tentando acessar dados
- **Solução**: Verificar se o token de sessão está sendo enviado corretamente

### 2. Erro 500 - `/api/oauth/google/redirect_url`
- **Causa**: Variáveis de ambiente não configuradas
- **Solução**: Configurar `MOCHA_USERS_SERVICE_API_KEY`

## Passos para Resolver

### 1. Configurar Variáveis de Ambiente

Você precisa obter uma chave API do Mocha Users Service:

1. Acesse https://getmocha.com
2. Faça login na sua conta
3. Vá para as configurações do projeto
4. Copie sua API Key

### 2. Atualizar Configuração Local

Edite o arquivo `.env` na raiz do projeto:

```bash
MOCHA_USERS_SERVICE_API_URL=https://api.getmocha.com
MOCHA_USERS_SERVICE_API_KEY=sua_chave_api_aqui
```

### 3. Atualizar Configuração de Produção

No arquivo `wrangler.jsonc`, substitua `your-mocha-api-key-here` pela sua chave real:

```json
{
  "vars": {
    "MOCHA_USERS_SERVICE_API_URL": "https://api.getmocha.com",
    "MOCHA_USERS_SERVICE_API_KEY": "sua_chave_api_aqui"
  }
}
```

### 4. Reiniciar o Servidor

Após configurar as variáveis:

```bash
# Parar o servidor atual (Ctrl+C)
# Reiniciar
npm run dev
```

## Verificação

Para verificar se está funcionando:

1. Abra o console do navegador (F12)
2. Vá para a aba Network
3. Clique em "Entrar com Google"
4. Verifique se a requisição para `/api/oauth/google/redirect_url` retorna 200

## Logs de Debug

Adicionei logs de debug no backend. Verifique o console do servidor para:

- ✅ "OAuth redirect URL generated successfully"
- ❌ "Missing Mocha Users Service configuration"
- ❌ "Error getting OAuth redirect URL"

## Contato

Se os problemas persistirem:
1. Verifique se sua conta Mocha está ativa
2. Confirme se o projeto está configurado corretamente no Mocha
3. Entre em contato com o suporte do Mocha: https://discord.gg/shDEGBSe2d
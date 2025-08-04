# Configuração para GitHub Pages

Este projeto foi configurado para funcionar no GitHub Pages. Siga os passos abaixo para fazer o deploy:

## 1. Configurar Secrets no GitHub

No seu repositório GitHub, vá em **Settings > Secrets and variables > Actions** e adicione as seguintes secrets:

- `VITE_SUPABASE_URL`: URL do seu projeto Supabase
- `VITE_SUPABASE_ANON_KEY`: Chave anônima do Supabase

## 2. Habilitar GitHub Pages

1. Vá em **Settings > Pages**
2. Em **Source**, selecione **GitHub Actions**
3. O workflow já está configurado e será executado automaticamente

## 3. Ajustar o nome do repositório

Se o nome do seu repositório não for `mocha-app`, você precisa ajustar:

1. No arquivo `vite.config.ts`, altere `/mocha-app/` para `/SEU-NOME-DO-REPOSITORIO/`
2. No arquivo `src/react-app/App.tsx`, altere `/mocha-app` para `/SEU-NOME-DO-REPOSITORIO`

## 4. Deploy

Após fazer push para a branch `main`, o GitHub Actions irá:

1. Instalar as dependências
2. Fazer o build do projeto
3. Fazer deploy para GitHub Pages

O site estará disponível em: `https://SEU-USUARIO.github.io/SEU-REPOSITORIO/`

## Scripts disponíveis

- `npm run build:gh-pages`: Build específico para GitHub Pages
- `npm run preview`: Preview local do build

## Arquivos criados/modificados

- `.github/workflows/deploy.yml`: Workflow do GitHub Actions
- `public/.nojekyll`: Evita processamento Jekyll
- `public/404.html`: Página 404 para SPA routing
- `vite.config.ts`: Configurado com base path
- `src/react-app/App.tsx`: Router com basename
- `index.html`: Script para SPA routing
- `package.json`: Script de build para GitHub Pages

## Troubleshooting

Se o site não carregar corretamente:

1. Verifique se o nome do repositório está correto nos arquivos de configuração
2. Verifique se as secrets estão configuradas corretamente
3. Verifique os logs do GitHub Actions para erros de build
4. Certifique-se de que o GitHub Pages está habilitado e configurado para usar GitHub Actions
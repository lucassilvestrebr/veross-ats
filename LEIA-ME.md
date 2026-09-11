# Veross ATS — código-fonte editável — versão funcional 1.1

Este pacote contém o código atual do ATS. Pode ser aberto e editado em um editor como VS Code, sem depender da conversa com o assistente.

## O que está implementado

- Vagas e candidatos, currículos PDF e histórico.
- Quadro com arraste de cards e confirmação de movimentação.
- Oito etapas e encerramento em Não contratado, com motivo e etapa de origem.
- Roteiros por função, tarefas obrigatórias e prazos em dias úteis com calendário editável.
- Avaliações MHMA individuais e discussão coletiva, com evidências e alertas.
- Teste prático de prospecção.
- Paleta do Branding Book Veross 2026.

## Instalação e execução local

Pré-requisitos: Node.js 22.13 ou superior compatível com as dependências e npm. Abra um terminal na pasta extraída e execute, nesta ordem:

```sh
npm run install:ci
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_sharp_firestar.sql
npm run dev
```

Aplique essa migração somente na primeira preparação de um banco vazio. Não a repita sobre um banco já inicializado. Para futuras alterações de esquema, use novas migrações.

Abra o endereço informado pelo servidor, normalmente http://localhost:5173/. Mantenha o processo aberto enquanto utilizar o sistema. Em execuções posteriores, basta `npm run dev`.

O ambiente de desenvolvimento possui autenticação simulada. Isso permite trabalhar localmente, mas não equivale a um login real por e-mail e senha. Não exponha o servidor de desenvolvimento à internet.

## Onde editar

- `app/workspace.tsx`: quadro, formulários, movimentações e navegação.
- `app/process-panels.tsx`: roteiros, avaliações MHMA, discussão coletiva e teste prático.
- `app/globals.css`: cores e estilos. Cores oficiais: azul #060923, dourado #AE8A56, amêndoa #ECD7B4, platina #CDCDD0 e branco #FCFCFC.
- `lib/process.ts`: roteiro inicial, pesos MHMA, regras de pontuação e dias úteis.
- `lib/transition.ts`: movimentação, pendências e encerramento.
- `lib/ats.ts`: estrutura e validação dos dados; cadastro inicial fornecido pelo usuário.
- `lib/upgrade.ts`: atualização dos registros da versão anterior para a 1.1.
- `app/api/state/route.ts`: leitura e gravação com controle de revisão.
- `app/api/resume/route.ts`: upload e download de currículos.
- `db/schema.ts` e `drizzle/`: estrutura do banco e migrações.

O roteiro inicial em código só é usado ao inicializar ou atualizar a base. Em uma base já atualizada, edite o roteiro pela aba Roteiros do ATS.

## Hospedagem e limites atuais

Este projeto é uma aplicação React/TypeScript com Vinext/Vite e backend Cloudflare Workers. NÃO é um site estático que funcione ao copiar um HTML para qualquer hospedagem.

O banco usa Cloudflare D1 (binding DB); os currículos usam R2 (binding BUCKET). A autenticação de produção atual espera os cabeçalhos fornecidos pelo Sites/ChatGPT. `.openai/hosting.json` identifica a integração existente e não contém senha ou token de acesso.

Para publicar fora do Sites, será necessário configurar recursos Cloudflare e adaptar autenticação e autorização para um provedor próprio. Login e senha, convites, recuperação de senha e permissões compartilhadas de RH/gestores ainda NÃO foram implementados. Atualmente, os dados são separados por usuário autenticado.

As decisões de recrutamento continuam humanas. A pontuação MHMA não move nem reprova candidatos automaticamente.

## Dados e backup

Este ZIP é uma entrega de CÓDIGO, não um backup da operação. Não inclui a base atual, currículos anexados, sessões, credenciais, node_modules ou arquivos compilados. O cadastro inicial presente no código foi mantido, mas as alterações posteriores feitas no ATS estão na base de dados.

Na execução local, os dados ficam em `.wrangler/state`. Para migrar a operação, faça backup separado do banco e dos arquivos. Pare o servidor antes de copiar essa pasta para evitar uma cópia inconsistente. Não publique backups em uma pasta pública do site.

## Verificação e atualização

```sh
npx tsc --noEmit
npm run build
```

A versão 1.1 foi verificada por compilação e testes das regras de migração, dias úteis, pontuação, alertas, movimentação e persistência. Não há teste visual completo da versão 1.1 incluído neste pacote.

As dependências e respectivas licenças são mantidas em package.json, package-lock.json e nos arquivos de licença presentes no código.

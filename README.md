# Veross ATS 1.2 — Vercel + Supabase

Código editável do ATS: quadro com arrastar e soltar, tarefas por etapa, roteiros D1/D2, vagas, avaliações MHMA, discussão coletiva e encerramento com motivo.

## Executar

Use Node.js 22. Copie `.env.example` para `.env.local`, execute `npm ci`, `npm run build` e `npm start`. Para editar com atualização automática, use `npm run dev`.

## Supabase

Execute `supabase/setup.sql` no SQL Editor do projeto correto. O script cria tabelas com RLS, funções de gravação com controle de revisão e o bucket privado `curriculos` (PDF, máximo 10 MB).

Crie cada usuário em Authentication > Users > Add user > Create new user. Use o e-mail da pessoa, defina uma senha e confirme o e-mail conforme o procedimento interno. Depois execute `supabase/liberar-acesso.sql` com esse e-mail. O script deve retornar uma linha; zero linhas significa que o usuário ainda não existe. As pessoas autorizadas compartilham a mesma base da equipe. Remover uma linha de `ats_members` revoga o acesso ao ATS. O administrador do Supabase gerencia usuários e senhas; esta versão não possui painel próprio de administração de usuários ou recuperação por e-mail.

Sem autenticação e sem vínculo à equipe, não há acesso a cadastros ou currículos. A chave publishable não concede privilégios administrativos. Nenhuma chave secreta é necessária no aplicativo.

## Vercel

Importe o repositório com preset Next.js, raiz `./`, Node.js 22 e as duas variáveis de `.env.example` em Production, Preview e Development. `vercel.json` define instalação, compilação e saída. Os deploys acompanham a branch principal.

## Dados existentes

O código inicia sem candidatos ou vagas. Dados operacionais devem ser migrados para o Supabase de forma privada, nunca incluídos no GitHub. O banco local da versão anterior não é alterado por este projeto. O script de instalação não sobrescreve uma base já preenchida. Faça exportações/backups no Supabase conforme a rotina da equipe.

## Estrutura

- `app/workspace.tsx` e `app/process-panels.tsx`: telas do ATS.
- `lib/process.ts`, `lib/transition.ts` e `lib/ats.ts`: processo, avaliações e validação.
- `app/api/state`: leitura e gravação com revisão para evitar sobrescrita concorrente.
- `lib/db.ts`: acesso ao PostgreSQL e ao armazenamento pelo Supabase.
- `app/login`, `app/api/auth` e `proxy.ts`: login, saída e renovação da sessão.
- `app/globals.css`: cores e apresentação da marca Veross.

As permissões atuais são por equipe: todos os membros autorizados podem editar a base. As validações detalhadas do processo passam pelas rotas do aplicativo; as funções do banco validam vínculo, formato básico, tamanho e revisão. Não há decisão automática de contratação.

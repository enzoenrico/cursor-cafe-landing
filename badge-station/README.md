# Estação de Badge — Cursor Além do Código

Serviço standalone de badges do evento **Cursor Além do Código** (*Cursor Beyond Coding*).

Convidados escaneiam o QR da estação no celular, recebem uma badge animada, definem o nome, personalizam o estilo e exportam um **vídeo WebM** da badge ao vivo.

## Recursos

- **Mesa com QR** (`/host`) — cria a estação e exibe o QR de check-in
- **Atribuição no celular** (`/join/[stationId]`) — o scan gera uma badge pessoal
- **Estúdio da badge** (`/badge/[badgeId]`) — nome, estilos, embaralhar cores
- **Exportação de vídeo animado** — grava a badge com shaders via MediaRecorder

Funciona sem banco de dados: as badges ficam no navegador do convidado (`localStorage`), com sync opcional na API em memória quando a instância do servidor está aquecida.

## Início rápido

```bash
cd badge-station
pnpm install
pnpm dev
```

Abra [http://localhost:3000/host](http://localhost:3000/host), confirme a estação e escaneie o QR (ou abra o link de entrada) no celular.

## Deploy na Vercel

### Um clique (projeto separado Badge Station)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fenzoenrico%2Fcursor-cafe-landing&root-directory=badge-station&project-name=badge-station&repository-name=badge-station)

Ou importe o repositório existente em um **novo** projeto Vercel e defina **Root Directory** como `badge-station` antes do deploy:

https://vercel.com/new/import?s=https://github.com/enzoenrico/cursor-cafe-landing

### Opção A — mesmo repositório GitHub, projeto separado (recomendado)

1. Crie um **novo** projeto Vercel a partir deste repositório (não reutilize o projeto do site / `curitiba-cursor`)
2. Nas configurações, defina **Root Directory** como `badge-station` **antes do primeiro deploy**
3. Framework: Next.js (automático)
4. Comandos de install/build podem ficar no padrão (`pnpm install` / `pnpm run build`)
5. Faça o deploy

Se Root Directory ficar vazio, a Vercel compila o site principal em vez deste app.

Confirme no log de build que o pacote é `badge-station@0.1.0`, e não `cursor-cafe-landing`.

### Opção B — extrair para um repositório próprio

```bash
# na raiz do repo
git subtree split -P badge-station -b badge-station-main
# crie um repo vazio no GitHub e então:
git push git@github.com:YOU/badge-station.git badge-station-main:main
```

Depois importe esse repo na Vercel como um app Next.js normal.

Nenhuma variável de ambiente é necessária.

## Scripts

| Comando       | Descrição              |
| ------------- | ---------------------- |
| `pnpm dev`    | Desenvolvimento local  |
| `pnpm build`  | Build de produção      |
| `pnpm start`  | Rodar produção         |
| `pnpm lint`   | ESLint                 |

## Stack

- Next.js App Router
- React 19
- Tailwind CSS v4
- Fundos animados `@paper-design/shaders-react`
- QR com `qrcode.react`
- Exportação de vídeo com `html-to-image` + `MediaRecorder`

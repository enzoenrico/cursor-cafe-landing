# Badge Station

Standalone event badge service extracted from the Cafe Cursor badge card experience.

Guests scan a host QR code on their phone, get assigned an animated badge, set their name, reroll/customize styles, and export a shareable **WebM video** of the live animated badge.

## Features

- **Host QR desk** (`/host`) — create a station and display a check-in QR
- **Phone claim** (`/join/[stationId]`) — scan assigns a personal badge
- **Badge studio** (`/badge/[badgeId]`) — name, style picker, reroll, shuffle colors
- **Animated video export** — records the live shader badge via MediaRecorder

Works without a database: badges persist in the guest’s browser (`localStorage`), with optional in-memory API sync when the server instance is warm.

## Quick start

```bash
cd badge-station
pnpm install
pnpm dev
```

Open [http://localhost:3000/host](http://localhost:3000/host), create a station, then scan the QR (or open the join link) on a phone.

## Deploy on Vercel

### Option A — same GitHub repo, separate project

1. Create a new Vercel project from this repository
2. Set **Root Directory** to `badge-station`
3. Framework: Next.js (auto)
4. Deploy

### Option B — extract to its own repo

```bash
# from repo root
git subtree split -P badge-station -b badge-station-main
# create a new empty GitHub repo, then:
git push git@github.com:YOU/badge-station.git badge-station-main:main
```

Then import that repo on Vercel as a normal Next.js app.

No environment variables are required.

## Scripts

| Command       | Description        |
| ------------- | ------------------ |
| `pnpm dev`    | Local development  |
| `pnpm build`  | Production build   |
| `pnpm start`  | Run production     |
| `pnpm lint`   | ESLint             |

## Stack

- Next.js App Router
- React 19
- Tailwind CSS v4
- `@paper-design/shaders-react` animated badge backgrounds
- `qrcode.react` host QR
- `html-to-image` + `MediaRecorder` video export

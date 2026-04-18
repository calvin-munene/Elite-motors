# AutoElite Motors

A premium car dealership website for the Kenyan market — built with React, Express, PostgreSQL, and AI-powered features.

**Live features:** dark luxury theme · KES currency · admin dashboard · AI chatbot · visual search · price negotiation · WhatsApp integration · lead scoring · analytics · RBAC · audit log · visitor tracking · Japan auctions sync · KRA duty calculator · and much more.

---

## Tech Stack

- **Frontend:** React 19 + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Node.js 20+ + Express 5 + Drizzle ORM + PostgreSQL
- **AI:** OpenAI (chat, vision, voice transcription)
- **Monorepo:** pnpm workspaces

---

## Architecture

In production, everything runs as **one single service**:

```
Browser → Express backend (Node.js)
               ├── /api/*   → REST API (cars, bookings, AI, admin...)
               └── /*       → Serves built React frontend (static files)
```

You only need **one server** and **one port**. No separate frontend/backend hosts needed. This makes the project compatible with **any** Node.js host on Earth.

---

## Project Structure

```
.
├── artifacts/
│   ├── api-server/        # Express backend (REST API + serves frontend in prod)
│   └── dealership/        # React frontend (customer site + admin dashboard)
├── lib/
│   ├── db/                # Drizzle ORM schema & database config
│   ├── api-spec/          # OpenAPI specification
│   ├── api-client-react/  # Auto-generated React query hooks
│   ├── api-zod/           # Auto-generated TypeScript types & validators
│   ├── integrations-openai-ai-react/   # OpenAI React hooks (voice)
│   └── integrations-openai-ai-server/  # OpenAI server client (chat, vision)
├── scripts/
│   └── seed.sql           # Initial data (cars, blog, settings, etc.)
├── render.yaml            # One-click Render Blueprint
├── Dockerfile             # Universal container image
├── docker-compose.yml     # Local Docker stack (app + Postgres)
└── .env.example           # Environment variable template
```

---

## Quick Start (Local Development)

### Prerequisites
- **Node.js 20+**
- **pnpm 9+** — `npm install -g pnpm`
- **PostgreSQL 14+** — local or free cloud ([Neon](https://neon.tech), [Supabase](https://supabase.com), [Railway](https://railway.app))

### Steps
```bash
# 1. Clone & install
git clone https://github.com/calvin-munene/Elite-motors.git
cd Elite-motors
pnpm install

# 2. Configure env
cp .env.example .env
# Edit .env — fill in DATABASE_URL, SESSION_SECRET, OPENAI_API_KEY

# 3. Create tables & seed
pnpm db:push
psql "$DATABASE_URL" -f scripts/seed.sql

# 4a. Production-style (single port, recommended)
pnpm build
pnpm start                                # → http://localhost:8080

# 4b. Or dev mode with hot reload (two terminals)
PORT=8080 pnpm --filter @workspace/api-server run dev
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/dealership run dev
#                                          → http://localhost:3000
```

**Default admin login:** `admin` / `admin123` *(change immediately)*

---

## Universal Build & Start Commands

These work on **every** Node.js host:

| Command | Purpose |
|---|---|
| `pnpm install` | Install dependencies |
| `pnpm db:push` | Create/sync database tables |
| `pnpm build` | Build frontend + backend for production |
| `pnpm start` | Start production server (serves API + frontend) |

---

## Deployment Guides

Pick whichever host you prefer — all use the same commands above.

### 🟢 Render (one-click)

1. Push repo to GitHub → [render.com](https://render.com) → **New** → **Blueprint**
2. Connect repo → Render reads `render.yaml` automatically
3. Add env vars: `DATABASE_URL`, `SESSION_SECRET`, `OPENAI_API_KEY`
4. Deploy

**Or manual Web Service:**
- Build: `npm install -g pnpm && pnpm install && pnpm db:push && pnpm build`
- Start: `pnpm start`

---

### 🟣 Railway

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub** → select repo
2. Add **PostgreSQL** plugin (auto-injects `DATABASE_URL`)
3. Add `SESSION_SECRET`, `OPENAI_API_KEY`
4. Settings:
   - **Build:** `pnpm install && pnpm db:push && pnpm build`
   - **Start:** `pnpm start`

---

### 🔵 Fly.io

```bash
# Install flyctl: https://fly.io/docs/hands-on/install-flyctl/
flyctl launch --no-deploy           # generates fly.toml
flyctl postgres create              # provision Postgres, attach automatically
flyctl secrets set SESSION_SECRET=$(openssl rand -hex 32) OPENAI_API_KEY=sk-...
flyctl deploy                       # uses Dockerfile
```

---

### 🟠 Heroku

```bash
heroku create autoelite-motors
heroku addons:create heroku-postgresql:essential-0
heroku config:set SESSION_SECRET=$(openssl rand -hex 32) OPENAI_API_KEY=sk-... NODE_ENV=production
heroku buildpacks:set heroku/nodejs
git push heroku main
```

Heroku auto-runs `pnpm install` then `pnpm build` then `pnpm start` (defined in root `package.json`).

---

### 🟦 DigitalOcean App Platform

1. **Apps** → **Create App** → connect GitHub repo
2. Auto-detected as Node.js. Override:
   - **Build command:** `npm install -g pnpm && pnpm install && pnpm db:push && pnpm build`
   - **Run command:** `pnpm start`
3. Attach a **Managed PostgreSQL** database
4. Add env vars and deploy

---

### 🟡 AWS (Elastic Beanstalk)

```bash
eb init -p node.js autoelite
eb create autoelite-prod --database.engine postgres
eb setenv SESSION_SECRET=... OPENAI_API_KEY=... NODE_ENV=production
eb deploy
```

Or use **AWS App Runner** with the included `Dockerfile`.

---

### 🔴 Google Cloud Run

```bash
# Requires gcloud CLI
gcloud run deploy autoelite \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,DATABASE_URL=...,SESSION_SECRET=...,OPENAI_API_KEY=..."
```

Cloud Run uses the included `Dockerfile` automatically.

---

### 🔷 Microsoft Azure (App Service)

```bash
az webapp up \
  --name autoelite-motors \
  --runtime "NODE:20-lts" \
  --sku B1
az webapp config appsettings set --name autoelite-motors --resource-group ... \
  --settings SESSION_SECRET=... DATABASE_URL=... OPENAI_API_KEY=... \
             SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

---

### ⚫ Vercel (works, but Cloud Run / Render is preferred)

Vercel is optimised for serverless. To deploy this Express app:

1. Add a `vercel.json` at the root:
   ```json
   {
     "version": 2,
     "builds": [{ "src": "artifacts/api-server/dist/index.mjs", "use": "@vercel/node" }],
     "routes": [{ "src": "/(.*)", "dest": "artifacts/api-server/dist/index.mjs" }]
   }
   ```
2. Run `pnpm build` first (Vercel won't run pnpm by default — use the dashboard's **Build Command override**: `pnpm install && pnpm build`)
3. Deploy: `vercel --prod`

---

### 🐋 Docker (works on any container host: Coolify, Dokploy, Portainer, Kubernetes, Nomad, etc.)

The included `Dockerfile` is multi-stage and production-ready.

```bash
# Build
docker build -t autoelite-motors .

# Run
docker run -d -p 8080:8080 \
  -e DATABASE_URL="postgresql://..." \
  -e SESSION_SECRET="$(openssl rand -hex 32)" \
  -e OPENAI_API_KEY="sk-..." \
  -e NODE_ENV=production \
  --name autoelite \
  autoelite-motors
```

**Or full local stack (app + Postgres) via docker-compose:**
```bash
docker compose up -d
```

---

### 💚 Coolify / Dokploy / CapRover (self-hosted PaaS)

1. Create a new application → **GitHub** source → select repo
2. **Build pack:** Dockerfile (auto-detected)
3. Add env vars in the dashboard
4. Deploy

---

### 🖥️ Bare VPS (Ubuntu / Debian / CentOS)

```bash
# 1. Install Node.js 20 + pnpm + PostgreSQL
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs postgresql
sudo npm install -g pnpm pm2

# 2. Clone & build
git clone https://github.com/calvin-munene/Elite-motors.git
cd Elite-motors
cp .env.example .env
nano .env                              # fill in your values
pnpm install
pnpm db:push
psql "$DATABASE_URL" -f scripts/seed.sql
pnpm build

# 3. Run permanently with pm2
pm2 start "pnpm start" --name autoelite
pm2 save && pm2 startup

# 4. Optional: nginx reverse proxy + SSL
sudo apt-get install -y nginx certbot python3-certbot-nginx
sudo nano /etc/nginx/sites-available/autoelite
# (paste reverse-proxy config below)
sudo ln -s /etc/nginx/sites-available/autoelite /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.com
```

**nginx reverse-proxy config:**
```nginx
server {
    server_name yourdomain.com;
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `SESSION_SECRET` | ✅ | 32+ char random string (`openssl rand -hex 32`) |
| `PORT` | ✅ | Server port (most hosts set automatically) |
| `NODE_ENV` | ✅ | Set to `production` when deploying |
| `OPENAI_API_KEY` | ⚪ | Enables AI chatbot, visual search, negotiation, voice listings |
| `WHATSAPP_PHONE_NUMBER_ID` | ⚪ | WhatsApp Cloud API |
| `WHATSAPP_ACCESS_TOKEN` | ⚪ | WhatsApp Cloud API |
| `WHATSAPP_VERIFY_TOKEN` | ⚪ | WhatsApp webhook |
| `VITE_API_URL` | ⚪ | Only if frontend/backend live on different domains |
| `LOG_LEVEL` | ⚪ | `debug` / `info` / `warn` / `error` (default: `info`) |

---

## Free Database Options

- **[Neon](https://neon.tech)** — 0.5 GB free, serverless Postgres ⭐ recommended
- **[Supabase](https://supabase.com)** — 500 MB free, includes auth & storage
- **[Railway](https://railway.app)** — $5 free credit/month
- **[Aiven](https://aiven.io)** — 1-month free trial

Once you have a database, just paste its connection string into `DATABASE_URL`.

---

## Features

### Customer-facing
Inventory browse / filter / compare / wishlist · Car detail with gallery + 360° view · Financing calculator · AI chatbot (multilingual) · Visual search (upload photo → find similar cars) · AI price negotiation · Personalised recommendations · Test drive booking · Trade-in valuation · Financing application · Blog · Testimonials · Team · Services · FAQ · Contact · KRA import duty calculator · WhatsApp button · Multi-language (EN / SW / 中文) · KES pricing throughout

### Admin dashboard
Analytics with charts · Live visitor tracking · Customer 360 view · Test-drive calendar · Lead scoring · Notification bell · RBAC (owner / manager / sales) · Audit log · Inventory CRUD + voice-to-listing · Inquiries / bookings / trade-ins / financing pipeline · Blog / testimonials / team / services / settings management · AI chatbot knowledge training · Japan auctions sync

---

## Support

Open an issue at: https://github.com/calvin-munene/Elite-motors/issues

---

## License

MIT

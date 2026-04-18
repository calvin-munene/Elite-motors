# AutoElite Motors

A premium car dealership website for the Kenyan market — built with React, Express, PostgreSQL, and AI-powered features.

**Live features:** dark luxury theme · KES currency · admin dashboard · AI chatbot · visual search · price negotiation · WhatsApp integration · lead scoring · analytics · RBAC · audit log · visitor tracking · Japan auctions sync · KRA duty calculator · and more.

---

## Tech Stack

- **Frontend:** React 19 + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Node.js + Express 5 + Drizzle ORM + PostgreSQL
- **AI:** OpenAI (chat, vision, voice transcription)
- **Monorepo:** pnpm workspaces

---

## How It Works (Architecture)

In production, everything runs as **one single service**:

```
Browser → Express backend (Node.js)
               ├── /api/*   → REST API (cars, bookings, AI, admin...)
               └── /*       → Serves built React frontend (static files)
```

You only need **one server** and **one port**. No separate frontend/backend servers needed.

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
├── render.yaml            # One-click Render deployment config
└── .env.example           # Environment variable template
```

---

## Quick Start (Local Development)

### Prerequisites
- **Node.js 20+**
- **pnpm 9+** — `npm install -g pnpm`
- **PostgreSQL 14+** — local or free cloud ([Neon](https://neon.tech), [Supabase](https://supabase.com), [Railway](https://railway.app))

### 1. Clone and install
```bash
git clone https://github.com/calvin-munene/Elite-motors.git
cd Elite-motors
pnpm install
```

### 2. Set environment variables
```bash
cp .env.example .env
# Edit .env — fill in DATABASE_URL, SESSION_SECRET, OPENAI_API_KEY
```

### 3. Create database tables
```bash
pnpm db:push
```

### 4. Load starter data
```bash
psql "$DATABASE_URL" -f scripts/seed.sql
```

### 5. Run in development
```bash
# Terminal 1 — API server
PORT=8080 pnpm --filter @workspace/api-server run dev

# Terminal 2 — Frontend
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/dealership run dev
```

Visit **http://localhost:3000** for the storefront.
Visit **http://localhost:3000/admin/login** for the admin panel.

**Default admin login:**
- Username: `admin`
- Password: `admin123` *(change this immediately)*

---

## Deployment

### Option A — Render (recommended, free tier available)

**One-click deploy using the included `render.yaml`:**

1. Push this repo to your GitHub.
2. Go to [render.com](https://render.com) → **New** → **Blueprint**.
3. Connect your GitHub and select this repo.
4. Render reads `render.yaml` and sets everything up automatically.
5. Add your environment variables in the Render dashboard:
   - `DATABASE_URL` — get a free PostgreSQL at [Neon](https://neon.tech)
   - `OPENAI_API_KEY` — from [platform.openai.com](https://platform.openai.com)
   - `SESSION_SECRET` — any random 32+ character string

**Or manually on Render:**
1. New **Web Service** → connect GitHub repo
2. **Build command:** `npm install -g pnpm && pnpm install && pnpm db:push && pnpm build`
3. **Start command:** `pnpm start`
4. **Environment:** Node
5. Add env vars from `.env.example`

---

### Option B — Railway

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**.
2. Select this repo.
3. Add a **PostgreSQL** plugin (Railway injects `DATABASE_URL` automatically).
4. Add remaining env vars from `.env.example`.
5. Set **Start command:** `pnpm start`
6. Set **Build command:** `pnpm install && pnpm db:push && pnpm build`

---

### Option C — VPS (DigitalOcean, Hetzner, AWS, etc.)

```bash
# Clone on your server
git clone https://github.com/calvin-munene/Elite-motors.git
cd Elite-motors

# Install pnpm if needed
npm install -g pnpm

# Install dependencies
pnpm install

# Set environment variables
cp .env.example .env
nano .env  # fill in your values

# Create database tables
pnpm db:push

# Load starter data
psql "$DATABASE_URL" -f scripts/seed.sql

# Build the project
pnpm build

# Start the server
pnpm start
```

The site will be live on whatever port you set in `PORT`. Use **nginx** as a reverse proxy for your domain + SSL.

**Keep it running with pm2:**
```bash
npm install -g pm2
pm2 start "pnpm start" --name autoelite
pm2 save && pm2 startup
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | 32+ char random string for cookie signing |
| `PORT` | Yes | Server port (Render/Railway set this automatically) |
| `NODE_ENV` | Yes | Set to `production` when deploying |
| `OPENAI_API_KEY` | Optional | Enables AI chatbot, visual search, negotiation, voice listings |
| `WHATSAPP_PHONE_NUMBER_ID` | Optional | WhatsApp Cloud API |
| `WHATSAPP_ACCESS_TOKEN` | Optional | WhatsApp Cloud API |
| `WHATSAPP_VERIFY_TOKEN` | Optional | WhatsApp webhook |
| `VITE_API_URL` | Optional | Only if frontend/backend are on separate domains |

---

## Useful Commands

```bash
pnpm install              # Install all dependencies
pnpm build                # Build frontend + backend for production
pnpm start                # Start production server (serves everything)
pnpm db:push              # Sync database schema
pnpm db:push-force        # Force sync (caution: may affect data)

# Development (run in separate terminals)
PORT=8080 pnpm --filter @workspace/api-server run dev
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/dealership run dev
```

---

## Features

### Customer-facing
Inventory browse, filter, compare, wishlist · Car detail with gallery + 360° view · Financing calculator · AI chatbot (multilingual) · Visual search (upload a photo → find similar cars) · AI price negotiation · Personalized recommendations · Test drive booking · Trade-in valuation · Financing application · Blog · Testimonials · Team · Services · FAQ · Contact · KRA import duty calculator · WhatsApp button · Multi-language (EN / SW / 中文) · KES pricing

### Admin dashboard
Analytics with charts · Live visitor tracking · Customer 360 view · Test drive calendar · Lead scoring · Notification bell · RBAC (owner / manager / sales) · Audit log · Inventory CRUD + voice-to-listing · Inquiries / bookings / trade-ins / financing pipeline · Blog / testimonials / team / services / settings management · AI chatbot knowledge training · Japan auctions sync

---

## Support

Open an issue at: https://github.com/calvin-munene/Elite-motors/issues

---

## License

MIT

# AutoElite Motors

A premium car dealership website for the Kenyan market — built with React, Express, PostgreSQL, and AI-powered features.

**Live demo features:** dark luxury theme · KES currency · admin dashboard · AI chatbot · visual search · price negotiation · WhatsApp integration · lead scoring · analytics · RBAC · audit log · visitor tracking · Japan auctions sync · KRA duty calculator · and more.

---

## Tech Stack

- **Frontend:** React 19 + Vite + TypeScript + Tailwind CSS + shadcn/ui + Wouter (routing) + TanStack Query
- **Backend:** Node.js + Express 5 + Drizzle ORM + PostgreSQL
- **AI:** OpenAI (chat, vision, voice transcription)
- **Monorepo:** pnpm workspaces

---

## Project Structure

```
.
├── artifacts/
│   ├── api-server/        # Express backend (REST API)
│   ├── dealership/        # Customer + admin React frontend
│   └── mockup-sandbox/    # Component preview workspace (dev only)
├── lib/
│   └── db/                # Drizzle schema & migrations
├── scripts/
│   └── seed.sql           # Initial data (cars, blog, settings, etc.)
└── .env.example           # Environment variable template
```

---

## Quick Start (Local Development)

### Prerequisites
- **Node.js 20+**
- **pnpm 9+** — install with `npm install -g pnpm`
- **PostgreSQL 14+** — local install or a free cloud DB ([Neon](https://neon.tech), [Supabase](https://supabase.com), [Railway](https://railway.app))

### 1. Clone and install
```bash
git clone https://github.com/calvin-munene/Auto_Elite_Motors.git
cd Auto_Elite_Motors
pnpm install
```

### 2. Set environment variables
```bash
cp .env.example .env
# Open .env in your editor and fill in DATABASE_URL, SESSION_SECRET, OPENAI_API_KEY
```

### 3. Create the database schema
```bash
pnpm --filter @workspace/db run push
```

### 4. Load seed data (cars, blog posts, settings, admin user)
```bash
psql "$DATABASE_URL" -f scripts/seed.sql
```

### 5. Run the development servers
Open three terminals:
```bash
# Terminal 1 — API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Terminal 2 — Dealership website
pnpm --filter @workspace/dealership run dev
```

Visit **http://localhost:5173** for the storefront and **http://localhost:5173/admin/login** for the admin dashboard.

### Default admin login
After loading the seed data, log in with:
- **Email:** `admin@autoelite.co.ke`
- **Password:** `admin123` *(change this immediately in `/admin/users`)*

---

## Deployment

### Option A — Vercel + Neon (easiest, ~5 min)

1. Push this repo to your GitHub account.
2. Go to [vercel.com](https://vercel.com) → **Import Project** → select the repo.
3. In the project settings, add the environment variables from `.env.example`.
4. Create a free PostgreSQL database at [neon.tech](https://neon.tech) and paste its connection string as `DATABASE_URL`.
5. Deploy. Vercel auto-redeploys on every `git push`.

### Option B — Railway (one-click full-stack)

1. Sign up at [railway.app](https://railway.app).
2. Click **New Project** → **Deploy from GitHub** → choose this repo.
3. Add a PostgreSQL plugin — Railway auto-injects `DATABASE_URL`.
4. Add the remaining environment variables.
5. Deploy. Custom domain support included.

### Option C — Self-hosted VPS (DigitalOcean, Hetzner, AWS, etc.)

```bash
# On your server:
git clone https://github.com/calvin-munene/Auto_Elite_Motors.git
cd Auto_Elite_Motors
pnpm install
cp .env.example .env  # fill in production values
pnpm --filter @workspace/db run push
psql "$DATABASE_URL" -f scripts/seed.sql
pnpm build
pnpm --filter @workspace/api-server run start
```

Use a process manager like **pm2** or **systemd** to keep it running, and **nginx** as a reverse proxy with SSL via Let's Encrypt.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | 32+ char random string for cookie signing |
| `PORT` | No | API server port (default: 8080) |
| `NODE_ENV` | Yes (prod) | `development` or `production` |
| `OPENAI_API_KEY` | Optional | Enables AI chatbot, visual search, negotiation, voice listings |
| `WHATSAPP_PHONE_NUMBER_ID` | Optional | WhatsApp Cloud API phone ID |
| `WHATSAPP_ACCESS_TOKEN` | Optional | WhatsApp Cloud API token |
| `WHATSAPP_VERIFY_TOKEN` | Optional | WhatsApp webhook verify token |

---

## Features

### Customer-facing
- Inventory browse, filter, compare, wishlist
- Car detail with image gallery, 360° view, financing calculator
- AI chatbot (multilingual)
- Visual search ("Snap & Find") — upload a photo to find similar cars
- AI price negotiation modal
- "Recommended for you" personalized suggestions
- Test drive booking, trade-in valuation, financing application
- Blog, testimonials, team, services, FAQ, contact
- KRA import duty calculator
- WhatsApp floating button
- Multi-language (EN / SW / 中文)
- KES currency throughout

### Admin dashboard
- Analytics with funnel & charts (Recharts)
- Live visitor tracking
- Customer 360 view
- Test drive calendar
- Lead scoring (auto-assigned)
- Notifications bell with polling
- RBAC (owner / manager / sales)
- Audit log
- Inventory CRUD with voice-to-listing
- Inquiries, bookings, trade-ins, financing pipeline
- Blog, testimonials, team, services, settings management
- AI chatbot knowledge training
- Japan auctions sync

---

## Useful Commands

```bash
pnpm install                                     # Install all dependencies
pnpm build                                       # Type-check and build everything
pnpm --filter @workspace/db run push             # Sync schema to database
pnpm --filter @workspace/db run push-force       # Force sync (data-loss possible)
pnpm --filter @workspace/api-server run dev      # Run API server
pnpm --filter @workspace/dealership run dev      # Run frontend
```

---

## Support

For deployment questions, open an issue at:
https://github.com/calvin-munene/Auto_Elite_Motors/issues

---

## License

MIT

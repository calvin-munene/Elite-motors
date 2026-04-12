# AutoElite Motors - Premium Car Dealership Website

## Overview

A complete, production-ready premium car dealership website and admin dashboard for "AutoElite Motors" — Nairobi, Kenya. Built as a pnpm workspace monorepo with TypeScript.

**Brand:** Dark luxury theme, black/charcoal background, crimson red (#DC2626) accent, Playfair Display headings, Inter body font.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/dealership) — served at /
- **API framework**: Express 5 (artifacts/api-server) — served at /api
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec at artifacts/api-server/openapi.yml)
- **Build**: esbuild (CJS bundle)
- **Styling**: Tailwind CSS v4 with dark luxury theme
- **Routing**: Wouter

## Dealership Info

- **Name**: AutoElite Motors
- **Location**: Ngong Road, next to Prestige Plaza, Nairobi, Kenya
- **Phone**: +254 700 234 567
- **WhatsApp**: 254700234567
- **Email**: sales@autoelitemotors.co.ke

## Admin Dashboard

- URL: /admin/login
- Default credentials: **username: admin / password: admin123**
- Full CRUD for: Cars, Inquiries, Bookings, Trade-Ins, Financing, Testimonials, Blog, Team, Services, Settings

## Public Pages (17+)

- / — Homepage with hero, featured cars, stats, services, testimonials
- /inventory — Inventory with filters (make, body type, condition, JDM-only toggle)
- /cars/:slug — Car detail with 360° viewer, live viewers badge, JDM info panel
- /compare — Side-by-side vehicle comparison (up to 3)
- /wishlist — Saved vehicles (localStorage-persisted)
- /kra-calculator — KRA import duty calculator (CIF, engine CC, fuel type)
- /showroom — Physical showroom info
- /about — About the dealership
- /team — Meet the team
- /services — All services offered
- /financing — Financing options
- /trade-in — Trade-in submission form
- /test-drive — Book a test drive
- /testimonials — Customer reviews
- /blog — Blog/News listing
- /blog/:id — Single blog post
- /contact — Contact page with Google Maps embed, WhatsApp link
- /faq — FAQ accordion
- /privacy — Privacy policy
- /terms — Terms and conditions

## Key Features

### Frontend Contexts
- **LanguageContext** — EN/SW toggle (localStorage persisted)
- **CurrencyContext** — KES/USD toggle with live conversion at settings.usdToKesRate
- **CompareContext** — Up to 3 cars, session state
- **WishlistContext** — localStorage persisted

### Navbar
- KES/USD currency toggle button
- EN/SW language toggle button
- Compare icon with count badge
- Wishlist heart icon with count badge
- Kenyan phone number from settings
- Mobile hamburger menu

### CarCard
- Live viewers badge (simulated, changes every 8s)
- "Just Listed" badge (if created within 7 days)
- JDM badge (if isJapaneseImport)
- Featured/New/Pre-Owned/Condition badges
- Availability color-coded badges
- Wishlist + Compare action buttons
- WhatsApp inquiry button
- KES/USD price formatting via CurrencyContext

### Car Detail Page
- Gallery / 360° View toggle
- Car360Viewer — drag-to-spin, zoom, auto-rotate, fullscreen
- Live viewers badge
- Japanese Import panel (auction grade, chassis number, shipping status, dates)
- JDM badge
- KES/USD pricing
- Wishlist + Compare action buttons

### AI Chatbot (AIChatbot.tsx)
- Floating button (bottom-right, red)
- Streaming SSE responses from OpenAI via /api/openai/conversations/:id/messages
- Kenya car market expert system prompt (KRA duty, JDM grades, NTSA, pricing in KES, banks)
- Quick prompt suggestions
- Conversation persistence in DB (conversations + messages tables)

### Admin Settings (Expanded)
- Tabbed: General | Contact | Content | Currency | Integrations | Branding
- Currency: default KES/USD + USD-KES exchange rate
- Google Maps embed URL
- WhatsApp API toggle
- Meta description, logo URL, primary color picker
- Footer tagline

## DB Schema Tables

- cars — includes isJapaneseImport, auctionGrade, chassisNumber, shippingStatus, japanDepartureDate, kenyaArrivalDate, viewCount
- site_settings — includes country, googleMapsEmbedUrl, heroImage, currency, usdToKesRate, footerTagline, whatsappApiEnabled, logoUrl, primaryColor, metaDescription
- conversations — AI chat conversations
- messages — AI chat messages (role: user/assistant)
- inquiries, bookings, trade_ins, financing_inquiries, testimonials, blog_posts, team_members, services, admin_users

## Seed Data

- 10 original cars (Mercedes, BMW, Porsche, Range Rover, Toyota, etc.)
- 5 Japanese import cars (Prado TX, Nissan X-Trail, Mazda CX-5, Honda Stepwgn, Toyota Harrier)
- Testimonials, team members, blog posts, services

## Key Commands

```bash
# Start development (from workspace root)
pnpm --filter @workspace/api-server run dev   # API server on PORT
pnpm --filter @workspace/dealership run dev    # Frontend on PORT

# DB
pnpm --filter @workspace/db run push           # Sync schema to DB

# Codegen (after changing openapi.yml)
pnpm --filter @workspace/api-client-react run codegen
```

## Important Notes

- The `cars` table uses `carsTable` (not `cars`) as the Drizzle export name
- `site_settings` is the actual DB table name (not `settings`)
- OpenAI model: `gpt-5.2` (streaming enabled)
- All car prices stored in USD; displayed in KES or USD based on user toggle
- WhatsApp number from settings.whatsapp (no hardcoding)
- AIChatbot uses direct fetch for SSE streaming (not React Query)

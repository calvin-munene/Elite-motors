# AutoElite Motors - Premium Car Dealership Website

## Overview

A complete, production-ready premium car dealership website and admin dashboard for "AutoElite Motors". Built as a pnpm workspace monorepo with TypeScript.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/dealership) — served at /
- **API framework**: Express 5 (artifacts/api-server) — served at /api
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Styling**: Tailwind CSS v4 with dark luxury theme (charcoal/black + crimson red accent)
- **Typography**: Playfair Display (headings) + Inter (body)
- **Animations**: Framer Motion
- **Routing**: Wouter

## Admin Dashboard

- URL: /admin/login
- Default credentials: **username: admin / password: admin123**
- Full CRUD for: Cars, Inquiries, Bookings, Trade-Ins, Financing, Testimonials, Blog, Team, Services, Settings

## Public Pages

- / — Homepage
- /inventory — Full inventory with filters
- /cars/:slug — Single car detail
- /showroom — Physical showroom info
- /about — About the dealership
- /team — Meet the team
- /services — All services
- /financing — Financing options & calculator
- /trade-in — Trade-in submission form
- /test-drive — Book a test drive
- /testimonials — Customer reviews
- /blog — Blog/News listing
- /blog/:id — Single blog post
- /contact — Contact page
- /faq — FAQ accordion
- /privacy — Privacy policy
- /terms — Terms and conditions

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/scripts run seed` — seed the database with sample data

## Database Schema

Tables: cars, inquiries, bookings, testimonials, blog_posts, team_members, services, site_settings, admin_users, trade_ins, financing_inquiries

## Contact Placeholder Data

- Phone: +1 (555) 234-5678
- WhatsApp: +15552345678
- Email: sales@autoelitemotors.com
- Address: 4820 Automotive Boulevard, Los Angeles, CA 90001
- Hours: Mon-Sat 9AM-7PM, Sun 11AM-5PM

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

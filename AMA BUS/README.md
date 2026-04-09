# AmaRide

AmaRide is a production-style full-stack public transport platform inspired by Odisha's Ama Bus experience. The repo ships a web app, a mobile companion, and an Express + Prisma backend for realtime bus telemetry, route discovery, QR ticketing, and admin operations.

## Stack

- `apps/web`: Next.js 14, TypeScript, TailwindCSS, Mapbox-ready live maps, Socket.IO client
- `apps/mobile`: Expo / React Native, Expo Router, location-aware commuter and driver screens
- `apps/api`: Express.js, Socket.IO, JWT auth, Prisma ORM, PostgreSQL, QR generation, Stripe-test-compatible simulation
- `packages/shared`: shared domain types and seeded demo shapes

## Core Features

- Passenger auth, profile, nearby stops, route planner, live buses, ETA, ticket history
- Ticket purchase with QR generation and Stripe-test-compatible payment flow
- Driver trip start, pause, resume, end, and recurring GPS broadcast
- Admin stats, live fleet monitor, route management, stop management, driver onboarding, system logs
- Dockerized local stack and deployment docs for Vercel + Railway/Render

## Monorepo Structure

```text
apps/
  api/       Express, Prisma, Socket.IO backend
  web/       Next.js passenger + driver + admin web UI
  mobile/    Expo mobile companion
packages/
  shared/    shared domain types and demo seed shapes
docs/
  api.md
  deployment.md
```

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Copy environment values:

```powershell
Copy-Item .env.example .env
Copy-Item apps/web/.env.local.example apps/web/.env.local
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/mobile/.env.example apps/mobile/.env
```

3. Start PostgreSQL with Docker or your own local instance:

```bash
docker compose up -d postgres
```

4. Generate Prisma client, migrate, and seed:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

5. Run the apps:

```bash
npm run dev:api
npm run dev:web
npm run dev:mobile
```

## Seed Accounts

- Admin: `admin@amaride.in` / `Password@123`
- Passenger: `passenger@amaride.in` / `Password@123`
- Driver: `driver1@amaride.in` / `Password@123`

## Payment Notes

- Default mode is simulation for local/offline setup.
- If `STRIPE_SECRET_KEY` is configured and `PAYMENT_SIMULATION=false`, ticket purchase uses Stripe test mode with `pm_card_visa`.

## Realtime Notes

- Drivers can update location over REST or Socket.IO.
- Passengers subscribe to route rooms via `passenger:subscribe_route`.
- Admin receives all active fleet broadcasts via `admin:all-buses`.

## Docs

- [API Reference](docs/api.md)
- [Deployment Guide](docs/deployment.md)

## Verification Status

The repository was scaffolded end to end, but dependency installation and runtime verification were not executed inside this environment. Run the quick-start steps locally to generate Prisma client, install packages, and validate the apps against your machine.

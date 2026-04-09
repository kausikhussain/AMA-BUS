# Deployment Guide

## Local Docker

```bash
docker compose up --build
```

This starts:

- PostgreSQL on `localhost:5432`
- API on `localhost:4000`
- Web app on `localhost:3000`

Run Prisma migration + seed after the database is healthy:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

## Frontend on Vercel

1. Import the repository into Vercel.
2. Set the project root to `apps/web`.
3. Configure env vars:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` if you later add browser-side Stripe Elements
4. Build command: `npm run build -w @amaride/web`
5. Output is handled automatically by Next.js.

## Backend on Railway or Render

1. Deploy from repo root using `apps/api` as the service focus.
2. Provision PostgreSQL and set `DATABASE_URL`.
3. Add:
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
   - `PORT`
   - `CORS_ORIGIN`
   - `PAYMENT_SIMULATION`
   - `STRIPE_SECRET_KEY` for real Stripe test charges
4. Build command:

```bash
npm install
npx prisma generate --schema apps/api/prisma/schema.prisma
npm run build -w @amaride/api
```

5. Start command:

```bash
npm run start -w @amaride/api
```

6. Run database migrations during deploy or as a one-off job:

```bash
npm run db:migrate
npm run db:seed
```

## Mobile

1. From `apps/mobile`, run `npx expo start`.
2. Set:
   - `EXPO_PUBLIC_API_URL`
   - `EXPO_PUBLIC_SOCKET_URL`
3. For production builds, switch to EAS or your preferred Expo deployment pipeline.

## Production Hardening Suggestions

- Add refresh tokens or secure cookie auth for the web client.
- Move notification delivery to Expo push / Web Push / FCM for real push alerts.
- Add background jobs for ticket expiry and arrival alerts.
- Replace demo GPS playback with native foreground/background tracking on mobile drivers.
- Add automated tests and CI before promoting beyond staging.

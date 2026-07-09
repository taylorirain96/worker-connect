# QuickTrade

QuickTrade is a Next.js marketplace for connecting homeowners and businesses with workers and tradies across New Zealand and Australia.

## Tech stack

- Next.js 15.5.18 App Router
- React 18
- TypeScript
- Tailwind CSS
- Firebase / Firestore / Firebase Storage
- Stripe

## Local setup

1. Install dependencies:

   ```bash
   npm ci
   ```

2. Copy your environment file:

   ```bash
   cp .env.example .env.local
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

## Environment variables

At minimum, configure the Firebase public env vars used by the frontend:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Optional but commonly used:

- `NEXT_PUBLIC_APP_URL` — canonical base URL for metadata, sitemap, and public links
- `FIREBASE_SERVICE_ACCOUNT_KEY` — server-side Firebase Admin access
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `OPENAI_API_KEY`
- `BUSINESS_VERIFICATION_API_KEY` — optional bearer token for external verification providers
- `BUSINESS_VERIFICATION_LICENSE_URL` — license verification provider endpoint
- `BUSINESS_VERIFICATION_INSURANCE_URL` — insurance verification provider endpoint
- `BUSINESS_VERIFICATION_BACKGROUND_URL` — background-check provider endpoint

## Validation

Run the repo checks before opening or updating a PR:

```bash
npm run lint
npm run build
```

## Mobile app (Expo)

An initial Expo React Native app scaffold is available at:

```bash
./mobile
```

To run it locally:

```bash
cd mobile
npm install
npm run web
```

## SEO and public URL notes

- The repo currently uses `NEXT_PUBLIC_APP_URL` as the canonical site URL when it is set.
- If that variable is missing, the fallback public URL is `https://quicktrade-pi.vercel.app`.
- Keep public metadata, sitemap entries, robots rules, and hard-coded marketing links aligned to the same base URL.

## Rate limiting

API routes are protected by an in-memory sliding-window rate limiter (`lib/rateLimit.ts`).
Counters are tracked **per client IP and per route category**.

> ⚠️ The in-memory store is single-process only. On a multi-instance deployment
> (e.g. Vercel with multiple serverless function instances) the effective limit
> is `max × number-of-instances`. Replace the store with
> [Upstash Redis](https://upstash.com/) or Vercel KV before scaling.

| Category | Routes | Limit |
|---|---|---|
| **Auth** | `POST /api/auth/login`, `POST /api/auth/session`, `POST /api/auth/register` | 5 req / min |
| **Contact** | `POST /api/contact` | 5 req / min |
| **Payment / escrow** | `/api/payments/*`, `/api/stripe/create-escrow`, `/api/stripe/release-payment`, `/api/payouts/*`, `/api/earnings/withdraw` | 10–20 req / min |
| **Messaging** | `GET /api/messages/*`, `POST /api/messages`, `POST /api/messages/send` | 30 req / min |
| **Search / browse** | `GET /api/search/*`, `GET /api/workers` | 30 req / min |

Webhook routes (`/api/stripe/webhook`, `/api/webhooks/stripe`) are intentionally **not** rate-limited because they originate from trusted external services (Stripe).

## Production quality expectations

- Do not bypass lint or TypeScript checks in production builds.
- Keep public pages crawlable only when they are useful landing pages.
- Ensure structured data, canonical URLs, and sitemap coverage stay in sync when adding public routes.
.

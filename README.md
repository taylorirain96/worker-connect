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

## Validation

Run the repo checks before opening or updating a PR:

```bash
npm run lint
npm run build
```

## SEO and public URL notes

- The repo currently uses `NEXT_PUBLIC_APP_URL` as the canonical site URL when it is set.
- If that variable is missing, the fallback public URL is `https://quicktrade-pi.vercel.app`.
- Keep public metadata, sitemap entries, robots rules, and hard-coded marketing links aligned to the same base URL.

## Production quality expectations

- Do not bypass lint or TypeScript checks in production builds.
- Keep public pages crawlable only when they are useful landing pages.
- Ensure structured data, canonical URLs, and sitemap coverage stay in sync when adding public routes.

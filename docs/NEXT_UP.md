# Next Up — Roadmap of Ready-to-Start Tasks

> Curated backlog of well-scoped tasks. Each item has a goal, the file/area
> pointers needed to start, and a clear acceptance criterion so any contributor
> (human or agent) can pick one up cold.

Last updated: 2026-05-21

---

## ✅ Recently shipped (context for what's next)

- **Auth middleware E2E coverage** (`e2e/auth-middleware.spec.ts`). 11 cases
  exercising the `auth-session` HMAC cookie round-trip end-to-end via
  Playwright: unauth → redirect + cookie clear, tampered/expired/garbage
  rejection, worker → `/dashboard` ok, worker → `/admin` bounced to
  `/dashboard`, admin → `/admin` ok. Test process and Next.js server share a
  deterministic `AUTH_SESSION_SECRET` defaulted in `playwright.config.ts`.
- **Lighthouse CI scaffold** for SEO landing pages — `lighthouserc.json`
  targets 5 representative URLs (`/`, `/services`, `/services/plumbing`,
  one NZ region/city, one AU city) and `.github/workflows/lighthouse.yml`
  builds + serves the app and runs `lhci autorun` on PRs (assertions
  currently `warn`-only until a baseline is captured — see task #7 below).
- **Mobile app — homeowner parity** (`mobile/App.tsx`). Expo app now has a
  Worker/Homeowner role toggle. Homeowner tabs (My Jobs, Post Job, Browse
  Workers, Bookings, Chat) reuse `/api/jobs`, `/api/workers`, `/api/bookings`
  and `/api/messages/list` with the `x-user-id` header (same pattern as web).
  `/api/jobs` GET now filters by `employerId` and reads Firestore; POST
  persists to the `jobs` collection (was previously stubbed).
- **Instant Booking — worker accept/decline window** with 24h auto-refund.
  Stripe webhook now promotes deposit-paid bookings to
  `awaiting_worker_response`; new `POST /api/instant-book/[id]/respond` lets
  the worker accept (status `confirmed`) or decline (Stripe refund + status
  `declined`); new hourly cron `/api/cron/instant-book-timeout` refunds and
  expires bookings the worker doesn't answer in time. Worker dashboard surfaces
  pending instant bookings at `/dashboard/worker/instant-bookings`.
- **Recurring jobs — worker-side view** (`/dashboard/worker/recurring`).
  Workers see their recurring assignments grouped by parent job and can opt
  out of being auto-assigned to future occurrences. Cron now drops
  `assignedWorkerId` from cloned occurrences for opted-out workers.
- Mover Mode `PUT /api/workers/[userId]/mover-mode` now persists full
  `MoverSettings` to the `moverSettings` Firestore collection (was previously
  just toggling a boolean and discarding the body).
- Worker dashboard exposes a **Mover Mode (Relocation / FIFO)** quick link.
- Admin dashboard has a new **NPS Insights** page at `/dashboard/admin/nps`
  surfacing promoters/passives/detractors and recent responses.
- **Auth middleware hardening** — middleware no longer trusts a bare
  `x-user-id` cookie. `POST /api/auth/session` now issues a single
  HMAC-signed `auth-session` cookie (`{uid, role, exp}`) using
  `AUTH_SESSION_SECRET`, and `middleware.ts` verifies the signature and
  expiry via Web Crypto on the Edge runtime before allowing access to
  `/dashboard` and `/admin`.
- `firebase` and `firebase-admin` major upgrades (previously listed as
  deferred in `KNOWN_ISSUES.md`) are now done. Outstanding `npm audit`
  findings are all transitive and can't be fixed without downgrading `next`.

---

## 🟢 Ready-to-start tasks

### 1. ~~Instant Booking — worker accept/decline window~~ ✅ Shipped
See "Recently shipped" above. The endpoint, Stripe webhook handling, hourly
timeout cron, and worker dashboard surface are all live.

### 2. ~~Mobile app — homeowner parity~~ ✅ Shipped
See "Recently shipped" above. Expo app gained a Worker/Homeowner role toggle
and the full homeowner tab set (My Jobs, Post Job, Browse Workers, Bookings,
Chat), all reusing existing REST endpoints with the `x-user-id` header.
`/api/jobs` was upgraded to read/write Firestore so the new tabs work.

---

### 3. ~~Sentry / error monitoring~~ ✅ Shipped
`@sentry/nextjs` is wired up via `instrumentation.ts` (Node + Edge),
`instrumentation-client.ts` (browser), `app/global-error.tsx`, and the
`withSentryConfig` wrapper in `next.config.js`. DSN, org, project, auth-token,
environment, release, and traces-sample-rate vars are documented in
`.env.example`. `beforeSend` scrubs PII (user email/name/IP, auth/cookie
headers, request body email/name/phone/password/idToken) before events leave
the process. Source maps upload only when `SENTRY_AUTH_TOKEN` is configured,
so builds without the secret still succeed.

---

### 4. ~~Auth middleware hardening~~ ✅ Shipped
See "Recently shipped" above. `POST /api/auth/session` already verified the
Firebase ID token, but the middleware previously only checked cookie
*presence*. It now verifies an HMAC-signed `auth-session` cookie containing
`{uid, role, exp}`, signed with `AUTH_SESSION_SECRET`, so a tampered or
forged cookie no longer satisfies the `/dashboard` and `/admin` guards.

---

### 5. ~~Playwright E2E for the highest-revenue path~~ ✅ Shipped
**Goal:** Lock in the post-job → quote → accept → escrow → release → review
flow with an automated end-to-end test.

**What shipped**
- ✅ Playwright scaffolding: `@playwright/test` dev dep,
  `playwright.config.ts` (webServer = `npm run start`), `e2e/smoke.spec.ts`
  covering the homepage + `/auth/login`, `npm run test:e2e` script, and a
  `.github/workflows/e2e.yml` job running on PRs.
- ✅ **Firebase emulator harness:**
  - `firebase.json` declares Auth (`9099`) and Firestore (`8080`) emulator
    ports.
  - `e2e/fixtures.ts` exports shared homeowner + worker fixture constants
    (UIDs, emails, passwords, roles) reused by setup and specs.
  - `e2e/globalSetup.ts` resets the emulator (auth + firestore REST DELETE)
    and seeds the two fixture accounts via `firebase-admin`. It's a no-op
    when emulator env vars aren't set, so existing smoke/auth specs keep
    running without Java.
  - `playwright.config.ts` wires `globalSetup` and forwards
    `FIRESTORE_EMULATOR_HOST` / `FIREBASE_AUTH_EMULATOR_HOST` /
    `NEXT_PUBLIC_USE_FIREBASE_EMULATOR` to the Next.js `webServer`.
  - `lib/firebase.ts` calls `connectAuthEmulator` /
    `connectFirestoreEmulator` in the browser when
    `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=1`.
- ✅ `e2e/revenue-path.spec.ts` exercises the post-job → quote → accept →
  escrow-create → release → review flow end-to-end against the Firebase
  emulator harness, using Stripe mock mode (`STRIPE_MODE=mock`) to avoid live
  payment endpoint calls.
- ✅ `e2e/stripe-webhook.spec.ts` drives the webhook route
  (`/api/stripe/webhook`) directly with HMAC-signed event payloads using
  Stripe's `generateTestHeaderString` helper. Covers:
  - `payment_intent.succeeded` (type=escrow) → escrow record status `held` +
    job `escrowStatus`/`workflowStage` updated in Firestore.
  - `charge.refunded` → payment record status `refunded` + refund document
    created in the `refunds` collection.
  - Negative cases: missing signature → 400, tampered payload → 400.
  - Deprecated `/api/webhooks/stripe` endpoint → 410 Gone.

**Acceptance** ✅
- `npm run test:e2e` runs Playwright headless, exercising the full path with
  one homeowner + one worker test account.
- New GitHub Actions job in `.github/workflows/` runs E2E on PRs.

---

### 6. ~~Auth middleware E2E coverage~~ ✅ Shipped
Playwright now covers the `auth-session` cookie round-trip end-to-end in
`e2e/auth-middleware.spec.ts` (11 cases):

- Unauthenticated `/dashboard` and `/admin` requests redirect to
  `/auth/login?redirect=...` and the response clears `auth-session` plus the
  legacy `x-user-id` / `x-user-role` cookies.
- Tampered, expired, and garbage cookies are rejected and cleared.
- A valid worker session reaches `/dashboard`; a worker session hitting
  `/admin` is bounced to `/dashboard` (not `/auth/login`); an admin session
  reaches `/admin`.
- Public routes (`/`, `/auth/login`) remain unauthenticated.

The Playwright `webServer` and the test process share a deterministic
`AUTH_SESSION_SECRET` (defaulted in `playwright.config.ts`) so the tests can
mint cookies directly via `lib/auth/sessionToken` without standing up Firebase.

---

### 7. Lighthouse audit pass on SEO landing pages 🟡 In progress
**Goal:** Hit ≥90 Performance and ≥95 SEO on the highest-traffic
service×city pages.

**Status**
- ✅ `lighthouserc.json` lands targeting 5 representative URLs:
  `/`, `/services`, `/services/plumbing`,
  `/services/plumbing/nz/auckland/auckland`, `/services/plumbing/au/sydney`.
- ✅ `.github/workflows/lighthouse.yml` builds the app, starts it on
  `127.0.0.1:3000`, runs `npx @lhci/cli autorun`, and uploads the report as
  an artifact. Reports are pushed to LHCI temporary public storage so each
  run links to a viewable report.
- 🟡 Assertions are currently `warn`-only (so the job never blocks PRs).
  Once a green baseline has been captured we should flip
  `categories:performance` and `categories:seo` to `error` in
  `lighthouserc.json`.

**Remaining work**
- Capture a baseline from the first CI run and fix any LCP/CLS regressions
  surfaced on those pages (likely image sizing, font loading, and
  server-rendered above-the-fold content).
- Tighten the assertions from `warn` → `error` once the targets are met.

**Pointers**
- Pages: `app/services/[service]/nz/[region]/[city]/page.tsx` and
  `app/services/[service]/au/[city]/page.tsx`
- Existing SEO config: `lib/seo/config.ts`, `lib/seo/servicesData.ts`
- Sitemap: `app/sitemap.ts`

**Acceptance**
- Lighthouse CI run committed (`lighthouserc.json`) targeting 5
  representative URLs. ✅
- New GitHub Actions job in `.github/workflows/` runs Lighthouse on PRs. ✅
- Any LCP/CLS regressions on those pages fixed (likely image sizing,
  font loading, and server-rendered above-the-fold content).

---

### 8. ~~Mover Mode — replace placeholder opportunities & stats with real data~~ ✅ Shipped
`lib/services/moverService.ts` now backs both helpers with live Firestore
queries via `adminDb`:

- `getMoverOpportunities(targetCity)` queries the `jobs` collection
  (`status == 'open'`, `createdAt desc`, limit 50), filters by case-insensitive
  city match, ranks by urgency then budget desc, and returns the top 20 as
  `MoverOpportunity[]`. `premiumMatch` reflects `featuredListing` /
  high+emergency urgency.
- `getMoverStats()` aggregates `moverSettings where isActive == true` for
  `totalMoverWorkers`, `avgRelocationSuccessRate`, and the top 5
  `targetRelocationCity` values; then walks recent completed jobs
  (`status == 'completed'`, limit 500) and buckets placements by month for the
  last 3 calendar months, computing avg success rate from the assigned
  workers' `moverSettings`.

The `/api/jobs/mover-opportunities` legacy branch was simplified to delegate
to `getMoverOpportunities` (no more duplicated inline Firestore query). The
mover page at `/workers/[id]/mover` now renders a proper empty state when no
opportunities match (or when no target city is set yet) and surfaces a
"Network Stats" panel from `/api/analytics/mover-stats`.

---

### 9. ~~Admin analytics — replace mock platform-wide data~~ ✅ Shipped
`lib/services/analyticsService.ts` no longer ships mock platform-wide arrays
(`ADMIN_MONTHLY_REVENUE`, `ADMIN_DAILY_STATS`, `TOP_WORKERS`, `ADMIN_CATEGORIES`
were all removed). `getAdminAnalytics()` now fetches from
`/api/admin/analytics?metric=dashboard` and returns an empty/zero
`AdminAnalytics` (with a 12-month zero-filled chart) when the API is
unavailable or the platform has no data yet — the same convention used by
homeowner/employer/jobseeker dashboards and worker analytics.

The dashboard aggregation route now always populates `adminAnalytics` and
buckets the daily signups/jobs/revenue series from real Firestore `createdAt`
timestamps instead of the previous `det()`-seeded pseudo-random series. The
Firestore-failure branch returns empty/zero values rather than fabricated
names, categories, cities, or activity events.

### 10. ~~Admin analytics — secondary metric endpoints (revenue/payments/disputes/system)~~ ✅ Shipped
`app/api/admin/analytics/route.ts` no longer returns hard-coded constants from
the `revenue`, `payments`, `disputes`, and `system` branches:

- **`metric=revenue`** aggregates the `payments` collection over the requested
  `startDate`/`endDate` window: gross volume (`employerSpent`), platform
  commission (`commission` / `platformFee`), worker earnings (gross − commission),
  transaction count, success rate (`completed`/`released` over total), previous
  equal-length-period delta, and a daily series capped at 90 buckets.
- **`metric=payments`** counts payments in range by status
  (`succeeded`/`failed`/`pending`/`refunded`) and groups by `paymentMethod`
  with per-method count, amount, and percentage.
- **`metric=disputes`** counts the `disputes` collection in range, splits
  open vs resolved (`resolved`/`closed`/`refunded`), computes
  `averageResolutionTime` from `resolvedAt − createdAt` (hours), and surfaces
  the top 5 `reason` buckets.
- **`metric=system`** returns explicit zeros — there is no runtime telemetry
  collection yet, so this branch deliberately surfaces empty values instead
  of fabricating uptime/latency numbers. Wiring it to Sentry or a metrics
  collection is a follow-up.

Every branch returns zero/empty values when the collection is missing or
Firestore is unavailable, matching the convention established by task #9.

---

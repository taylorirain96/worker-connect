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

### 5. Playwright E2E for the highest-revenue path 🟡 In progress
**Goal:** Lock in the post-job → quote → accept → escrow → release → review
flow with an automated end-to-end test.

**Status**
- ✅ Playwright scaffolding landed: `@playwright/test` dev dep,
  `playwright.config.ts` (webServer = `npm run start`), `e2e/smoke.spec.ts`
  covering the homepage + `/auth/login`, `npm run test:e2e` script, and a
  `.github/workflows/e2e.yml` job running on PRs.
- ✅ **Firebase emulator harness foundation landed:**
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
- 🟡 `e2e/revenue-path.spec.ts` is still a `test.fixme` placeholder. Stripe
  test-mode keys + a webhook signing secret (or `stripe-mock`) still need
  to be injected so `/api/stripe/webhook` accepts simulated
  `payment_intent.succeeded` / `charge.refunded` events.

**Remaining work**
- Add a `test:e2e:emulators` script (e.g. via `firebase emulators:exec`)
  and a CI job that installs Java + `firebase-tools` so the seeded harness
  actually runs on PRs. The current `e2e.yml` job still only runs the
  smoke + auth-middleware specs.
- Inject Stripe test-mode keys (or stand up `stripe-mock`) plus a webhook
  signing secret so `/api/stripe/webhook` accepts simulated
  `payment_intent.succeeded` / `charge.refunded` events during the run.
- Implement the revenue-path steps in `e2e/revenue-path.spec.ts` using two
  browser contexts (homeowner + worker) and the fixtures from
  `e2e/fixtures.ts`.

**Acceptance**
- `npm run test:e2e` runs Playwright headless, exercising the full path with
  one homeowner + one worker test account.
- New GitHub Actions job in `.github/workflows/` runs E2E on PRs. ✅

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

### 8. Mover Mode — replace placeholder opportunities & stats with real data
**Goal:** Stop shipping hardcoded mover data to workers using the
Relocation / FIFO feature.

**Pointers**
- `lib/services/moverService.ts` — `getMoverOpportunities` returns two
  hardcoded jobs and `getMoverStats` returns hardcoded city + monthly
  arrays. Only `getMoverLeaderboard` is wired to Firestore.
- `app/workers/[id]/mover/page.tsx` — consumes the placeholder helpers.
- `app/api/jobs/mover-opportunities/route.ts` — already exists; should
  become the canonical query path for `getMoverOpportunities`.

**Remaining work**
- Implement `getMoverOpportunities(targetCity)` as a real Firestore query
  on `jobs` (filter by `location`/`region`, `status === 'open'`,
  willingToRelocate match), ordered by urgency + budget, capped at N.
- Implement `getMoverStats()` as a server aggregation (Firestore counts +
  per-month rollups) or back it with a scheduled cron writing to a
  `moverStats` doc.
- Update the mover page to surface the real data + a proper empty state.

**Acceptance**
- No hardcoded `opp_${Date.now()}` / placeholder city arrays remain in
  `lib/services/moverService.ts`.
- Mover page renders live opportunities for the worker's target city, or a
  clear empty state when none match.

---

### 9. Admin analytics — replace mock platform-wide data
**Goal:** Make the admin analytics dashboard reflect real platform activity.

**Pointers**
- `lib/services/analyticsService.ts` — top-of-file comment already calls
  out that admin analytics uses mock data pending "a dedicated server-side
  aggregation route". Worker analytics already query Firestore.
- Admin dashboard pages under `app/dashboard/admin/` consume the mocked
  helpers.

**Remaining work**
- Add a server-side aggregation route (e.g.
  `/api/admin/analytics/platform`) that, behind the admin role guard, runs
  Firestore aggregation queries for monthly revenue, weekly activity,
  growth score, etc. — or rolls them into a `platformAnalytics/{period}`
  doc updated by a daily cron.
- Swap the admin analytics consumers to fetch from the new route and
  remove the mock fallbacks.

**Acceptance**
- `lib/services/analyticsService.ts` no longer ships mock platform-wide
  arrays.
- Admin analytics pages render real numbers (or a clear empty state on a
  fresh install).

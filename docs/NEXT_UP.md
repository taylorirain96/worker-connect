# Next Up — Roadmap of Ready-to-Start Tasks

> Curated backlog of well-scoped tasks. Each item has a goal, the file/area
> pointers needed to start, and a clear acceptance criterion so any contributor
> (human or agent) can pick one up cold.

Last updated: 2026-05-12

---

## ✅ Recently shipped (context for what's next)

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
- `firebase` and `firebase-admin` major upgrades (previously listed as
  deferred in `KNOWN_ISSUES.md`) are now done. Outstanding `npm audit`
  findings are all transitive and can't be fixed without downgrading `next`.

---

## 🟢 Ready-to-start tasks

### 1. ~~Instant Booking — worker accept/decline window~~ ✅ Shipped
See "Recently shipped" above. The endpoint, Stripe webhook handling, hourly
timeout cron, and worker dashboard surface are all live.

### 2. Mobile app — homeowner parity
**Goal:** Bring homeowner flows into the Expo app (currently worker-only).

**Pointers**
- Worker tabs: `mobile/App.tsx` (jobs, bookings, chat, earnings)
- Web homeowner dashboard: `app/dashboard/homeowner/page.tsx`
- Web post-job flow: `app/post/homeowner/`

**Acceptance**
- New homeowner tab set: My Jobs, Post Job, Browse Workers, Bookings, Chat.
- Reuses existing `/api/jobs`, `/api/workers`, `/api/bookings` endpoints
  with `x-user-id` header (matches web pattern).

---

### 3. Sentry / error monitoring
**Goal:** Capture client + server errors with stack traces and release tags.

**Pointers**
- No monitoring SDK currently in `package.json`.
- Add `@sentry/nextjs`; configure via `sentry.client.config.ts`,
  `sentry.server.config.ts`, `sentry.edge.config.ts`, and Next.js wrapper in
  `next.config.js`.
- Add `SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` to
  `.env.example`.

**Acceptance**
- Errors thrown in API routes and React components reach Sentry in dev.
- Source maps uploaded on Vercel build.
- PII scrubbing enabled (`beforeSend` strips `email`, `name`, headers).

---

### 4. Auth middleware hardening
**Goal:** Stop trusting a self-asserted `x-user-id` cookie. Today
`POST /api/auth/session` accepts any UID-shaped string and writes the cookie
that `middleware.ts` checks — anyone can curl this endpoint and bypass the
`/dashboard` and `/admin` redirect guard.

**Pointers**
- `middleware.ts` — currently only checks cookie presence.
- `app/api/auth/session/route.ts` — accepts `{uid}` with no proof.
- `components/providers/AuthProvider.tsx` — sends `uid` after sign-in.
- Edge middleware can't use `firebase-admin`; pick one of:
  - **A. Firebase session cookies** (`adminAuth.createSessionCookie` +
    `verifySessionCookie`) — switch middleware to the Node runtime.
  - **B. HMAC-signed cookie** like `lib/email/unsubscribeToken.ts` — server
    verifies the Firebase ID token via `adminAuth.verifyIdToken`, then
    signs `{uid, exp}`. Middleware verifies HMAC via Web Crypto.

**Acceptance**
- POSTing arbitrary JSON to `/api/auth/session` no longer grants a session.
- Middleware rejects tampered/expired cookies.
- Existing sign-in / sign-out flows still work end-to-end.

---

### 5. Playwright E2E for the highest-revenue path
**Goal:** Lock in the post-job → quote → accept → escrow → release → review
flow with an automated end-to-end test.

**Pointers**
- No `playwright/` or `e2e/` directory exists yet.
- Run against a Firebase emulator (already used in some unit tests — check
  `firestore.rules` and `package.json` scripts) or a seeded test project.

**Acceptance**
- `npm run test:e2e` runs Playwright headless, exercising the full path with
  one homeowner + one worker test account.
- New GitHub Actions job in `.github/workflows/` runs E2E on PRs.

---

### 6. Auth middleware E2E coverage
**Goal:** Prove the `x-user-id` cookie sync round-trip is correct on
sign-in, sign-out, and role switch.

**Pointers**
- `middleware.ts` (gates `/dashboard`, `/admin`)
- `components/providers/AuthProvider.tsx` (cookie sync)
- `app/api/auth/session/route.ts` (HttpOnly cookie set/clear)

**Acceptance**
- Playwright test: sign in → cookie set → can hit `/dashboard` → sign out →
  cookie cleared → `/dashboard` redirects to `/auth/signin`.
- Role-switch test: dual-role user toggles → server cookie still matches uid.

---

### 7. Lighthouse audit pass on SEO landing pages
**Goal:** Hit ≥90 Performance and ≥95 SEO on the highest-traffic
service×city pages.

**Pointers**
- Pages: `app/services/[service]/nz/[region]/[city]/page.tsx` and
  `app/services/[service]/au/[city]/page.tsx`
- Existing SEO config: `lib/seo/config.ts`, `lib/services/servicesData.ts`
- Sitemap: `app/sitemap.ts`

**Acceptance**
- Lighthouse CI run committed (e.g. `lighthouserc.json`) targeting 5
  representative URLs.
- Any LCP/CLS regressions on those pages fixed (likely image sizing,
  font loading, and server-rendered above-the-fold content).

# Next Up — Roadmap of Ready-to-Start Tasks

> Curated backlog of well-scoped tasks. Each item has a goal, the file/area
> pointers needed to start, and a clear acceptance criterion so any contributor
> (human or agent) can pick one up cold.

Last updated: 2026-05-11

---

## ✅ Recently shipped (context for what's next)

- Mover Mode `PUT /api/workers/[userId]/mover-mode` now persists full
  `MoverSettings` to the `moverSettings` Firestore collection (was previously
  just toggling a boolean and discarding the body).
- Worker dashboard exposes a **Mover Mode (Relocation / FIFO)** quick link.
- Admin dashboard has a new **NPS Insights** page at `/dashboard/admin/nps`
  surfacing promoters/passives/detractors and recent responses.

---

## 🟢 Ready-to-start tasks

### 1. Recurring jobs — worker-side view
**Goal:** Workers assigned to a recurring job should see all upcoming
occurrences and be able to opt out of future ones.

**Pointers**
- Existing homeowner view: `app/dashboard/homeowner/recurring/page.tsx`
- Cron generator: `app/api/cron/recurring-jobs/route.ts`
- Job fields: `recurring`, `recurrenceInterval`, `nextRecurrenceAt`,
  `parentJobId` in `types/index.ts`

**Acceptance**
- New page `app/dashboard/worker/recurring/page.tsx` lists jobs where
  `assignedWorkerId == user.uid && recurring == true`, grouped by
  `parentJobId`.
- Worker can request to opt out of future occurrences (write to a new
  `recurringOptOuts` subcollection or Job field; cron must respect it).
- Quick link added to worker dashboard.

---

### 2. Instant Booking — worker accept/decline window
**Goal:** After a homeowner pays the deposit via Instant Book, the worker has
24h to confirm. If they decline or time out, the deposit is auto-refunded.

**Pointers**
- Endpoint: `app/api/instant-book/route.ts`
- Firestore collection: `instantBookings`
- Stripe refund pattern: search for `stripe.refunds.create` in
  `app/api/payments/`

**Acceptance**
- New `POST /api/instant-book/[id]/respond` (worker-only) accepts
  `{action: 'accept' | 'decline'}`.
- Decline triggers Stripe refund + status `declined`.
- New cron `app/api/cron/instant-book-timeout/route.ts` (hourly via
  `vercel.json`) refunds bookings older than 24h with status `pending`.
- Worker dashboard surfaces pending instant bookings.

---

### 3. Mobile app — homeowner parity
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

### 4. Sentry / error monitoring
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

### 7. Resolve deferred dependency vulnerabilities
**Goal:** Clear the `firebase-admin` v10 / `firebase` v12.13.0 transitive
issues called out in `KNOWN_ISSUES.md`.

**Pointers**
- `KNOWN_ISSUES.md` lines 11–18
- `package.json` — current versions
- Dependabot already opens PRs (`.github/dependabot.yml`)

**Acceptance**
- Either: upgrade forward to a release where `@tootallnate/once` and
  `undici` advisories are resolved, **or** migrate the small surface that
  uses the broken APIs and downgrade safely.
- `npm audit --omit=dev --audit-level=high` exits clean (matches the gate
  in `.github/workflows/security-audit.yml`).

---

### 8. Lighthouse audit pass on SEO landing pages
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

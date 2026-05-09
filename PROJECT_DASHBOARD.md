# 🚀 QuickTrade — Project Dashboard
> Last updated: April 2026 | Single source of truth for the QuickTrade platform

---

## 📋 Project Overview

| Key | Value |
|-----|-------|
| **Product** | QuickTrade |
| **Tagline** | New Zealand's premium trade & labour marketplace |
| **Repo** | https://github.com/taylorirain96/worker-connect |
| **Live URL** | https://quicktrade.co.nz |
| **Stack** | Next.js 15.5.18 · TypeScript · Firebase · Stripe · Tailwind CSS · Vercel |
| **Target Market** | New Zealand — tradies, homeowners, job seekers, employers |
| **Design System** | Dark luxury — indigo→violet gradients, platinum accents, Lucide icons |
| **Locale** | NZ-first (NZD, en-NZ, 15% GST) |
| **Project Start** | April 2026 |

---

## ✅ Feature Matrix

| Feature | Status | Notes |
|---------|--------|-------|
| Firebase Auth (email + Google OAuth) | ✅ Live | Role-based redirects on sign-in |
| Role-based access (Worker / Employer / Admin) | ✅ Live | Firestore `users/{uid}.role` |
| Dual-role toggle (Worker ↔ Employer) | ✅ Live | Users can switch active role |
| Worker profile (read + edit + avatar upload) | ✅ Live | Firebase Storage |
| Employer profile | ✅ Live | |
| Job posting (employer) | ✅ Live | |
| Job applications (worker) | ✅ Live | |
| Application management (employer accept/reject) | ✅ Live | Dashboard widget |
| Real-time chat (Firebase RTDB) | ✅ Live | Worker ↔ Employer |
| In-app notifications (Firestore triggers) | ✅ Live | |
| Star ratings & written reviews | ✅ Live | After job completion |
| Photo reviews (before/after galleries) | ✅ Live | Quality verification |
| Rating appeals | ✅ Live | |
| Stripe payments + escrow | ✅ Live | Funds held until job complete |
| Stripe webhooks | ✅ Live | Signature verified |
| Stripe Connect (worker payouts) | ✅ Live | |
| Invoice generation | ✅ Live | |
| Dispute resolution | ✅ Live | Admin-mediated |
| NZ GST compliance (15%) | ✅ Live | Applied to all transactions |
| Platform profit tracking | ✅ Live | |
| Timesheets & cost tracker (per-job) | ✅ Live | Worker-only nav |
| Earnings dashboard | ✅ Live | |
| Payouts page | ✅ Live | |
| Quotes system (submit, view, accept/reject) | ✅ Live | Full itemised breakdown |
| Quote AI price suggestion | ✅ Live | NZ market data, one-click fill |
| Quote photo/file attachments | ✅ Live | Firebase Storage, up to 5 files |
| Quote counter-offer / negotiation | ✅ Live | `countered` status, PATCH API |
| Quote win/loss stats (workers) | ✅ Live | Win rate, avg price, response time |
| Quote expiry countdown | ✅ Live | Amber/red urgency colours |
| Quote comparison view | ✅ Live | Side-by-side for employers |
| AI job matching algorithm | ✅ Live | Scoring + API routes |
| AI writing assistant (CV + cover letter) | ✅ Live | Subscription-gated |
| AI Writing Add-on ($9.99 one-off) | ✅ Live | Upsell on click |
| AI job categorisation | ✅ Live | |
| AI chatbot assistant | ✅ Live | |
| Weekly job digest email | ✅ Live | |
| Welcome email | ✅ Live | |
| Worker onboarding flow | ✅ Live | Stripe Connect + verification |
| Worker verification system | ✅ Live | Mover Mode reputation boost |
| Leaderboard | ✅ Live | Indigo/violet design, Lucide icons |
| Referrals system | ✅ Live | |
| QTC token earning & redemption | ✅ Live | |
| Growth & intelligence dashboard | ✅ Live | |
| Admin dashboard | ✅ Live | Payment analytics, disputes, monitoring |
| Admin SEO operations dashboard | ✅ Live | /admin/seo |
| Master Playbook (admin-only) | ✅ Live | /admin/playbook |
| Advanced search & filtering | ✅ Live | |
| /how-it-works page | ✅ Live | Premium dark design |
| /pricing page | ✅ Live | Employer tiers + worker commission ladder |
| Founders Deal landing page | ✅ Live | Early-access offer |
| /about page | ✅ Live | |
| /contact page | ✅ Live | |
| /press page | ✅ Live | |
| /partners page | ✅ Live | |
| Google Analytics (GA4) | ✅ Live | |
| Google Search Console | ✅ Live | Verified |
| XML sitemap (dynamic) | ✅ Live | Includes all SEO pages + blog |
| robots.txt | ✅ Live | |
| OG images (dynamic) | ✅ Live | Per page type |
| Twitter/X cards | ✅ Live | |
| JSON-LD structured data | ✅ Live | LocalBusiness, Service, FAQ, BreadcrumbList, AggregateRating, Article |
| Service landing pages (17 NZ trades) | ✅ Live | |
| City SEO pages (10 NZ cities) | ✅ Live | |
| Region SEO pages | ✅ Live | /services/[service]/nz/[region] |
| MDX blog | ✅ Live | 10+ NZ trade posts |
| NZ-first locale | ✅ Live | en-NZ, NZD, NZ placeholders |
| Dark luxury design system | ✅ Live | Indigo→violet, platinum |
| Mobile responsive | ✅ Live | |
| Disputes page | ✅ Live | |
| Settings page | ✅ Live | |
| Reports page | ✅ Live | |
| Australian expansion (AU landing + service×city pages) | ✅ Live | AUD, ABN validation, 10% GST |
| Video worker profiles (upload + playback) | ✅ Live | Firebase Storage, HTML5 player |
| Background check integration | ✅ Live | Worker-initiated, admin-reviewed |
| Open API for partner integrations | ✅ Live | x-api-key auth, jobs + workers endpoints |
| WorkSafe NZ compliance module | ✅ Live | Checklist, badge on worker card |
| Apprenticeship / training listings | ✅ Live | Dedicated category + pages + navbar link |
| Job Milestone Billing & Progress Tracking | ✅ Live | Milestone escrow releases, worker progress log, approval flow |
| SMS notifications (Twilio) | ✅ Live | Application accepted/rejected, payment released, booking confirmed/declined |
| Worker portfolio with photo gallery | ✅ Live | /dashboard/worker/portfolio, gallery on public profile |
| Booking & availability system | ✅ Live | /dashboard/worker/availability, /workers/[id]/book |
| Service packages (fixed-price packages) | ✅ Live | /dashboard/worker/service-packages, /packages, on worker profile |
| In-app messaging (Firestore) | ✅ Live | Real-time chat, typing indicators, image upload, unread badge |
| FCM push notifications | ✅ Live | Background + foreground push, 7-day snooze prompt |
| Promo codes & credit system | ✅ Live | /dashboard/admin/promos, /api/promos, /api/credits |
| Favourite workers | ✅ Live | FavouriteButton, /dashboard/homeowner/favourites |
| Admin analytics dashboard | ✅ Live | /dashboard/admin/analytics, recharts, 5-min cache |
| Affiliate payout dashboard | ✅ Live | /dashboard/admin/affiliates, Stripe Transfer |
| Worker trade licences & certifications | ✅ Live | /dashboard/worker/trade-licences, displayed on public worker profile |
| Homeowner Spending Dashboard | ✅ Live | /dashboard/homeowner/spending, monthly spend chart + category breakdown |
| Homeowner Search Alerts Management | ✅ Live | /dashboard/homeowner/alerts, create/delete/toggle job alerts |
| Worker Subscription / Pro Tier Page | ✅ Live | /dashboard/worker/subscription, plan management + upgrade flow |
| Worker Quote Templates | ✅ Live | /api/quote-templates, /dashboard/worker/quote-templates, load-template in WorkerQuoteForm |
| Instant Booking (Service Packages) | ✅ Live | `instantBook` flag on ServicePackage; POST /api/instant-book (Stripe deposit); homeowner checkout flow |
| Recurring Jobs | ✅ Live | `recurring` + `recurrenceInterval` on Job; cron at /api/cron/recurring-jobs (daily 6am NZST); /dashboard/homeowner/recurring |
| NZ Licence Verification (MBIE) | ✅ Live | POST /api/worker-trade-licences/verify; LBP/electrical/plumbing pattern match; governmentVerified badge |
| NPS Survey System | ✅ Live | POST /api/nps; cron /api/cron/nps-trigger (7-day post-completion trigger); /nps page |
| Social Proof Ticker | ✅ Live | GET /api/platform/live-activity (5-min cache); SocialProofTicker component on homepage |
| Worker of the Month | ✅ Live | GET /api/platform/worker-of-month (1-hr cache); WorkerOfMonth card on homepage |
| Property Manager Role & Dashboard | ✅ Live | `property_manager` role; Property type; GET/POST /api/properties; /dashboard/property-manager |
| Dependabot Dependency Scanning | ✅ Live | .github/dependabot.yml — weekly npm + actions updates, NZ timezone |

---

## 🏗️ App Structure

```
app/
├── page.tsx                    # Homepage (2-step interactive hero)
├── layout.tsx                  # Root layout (GA4, fonts, providers)
├── sitemap.ts                  # Dynamic XML sitemap
├── robots.ts                   # robots.txt
├── opengraph-image.tsx         # Dynamic OG image
├── about/                      # About QuickTrade
├── admin/                      # Admin dashboard
│   ├── seo/                    # SEO operations dashboard
│   └── playbook/               # Master Playbook (admin-only)
├── analytics/                  # Platform analytics
├── auth/                       # Sign in / sign up / reset password
├── blog/                       # MDX blog index
│   └── [slug]/                 # Individual blog post (MDX)
├── business/                   # Business landing page
├── contact/                    # Contact page
├── dashboard/                  # Role-based dashboard (worker/employer)
├── disputes/                   # Dispute management
├── earnings/                   # Worker earnings overview
├── founders-deal/              # Founders Deal landing page
├── growth/                     # Growth & intelligence
├── how-it-works/               # How QuickTrade works
├── invoices/                   # Invoice list + detail
├── jobs/                       # Job board + post a job + job detail
├── leaderboard/                # Worker leaderboard (indigo/violet design)
├── messages/                   # Real-time chat (Firebase RTDB)
├── notifications/              # Notification centre
├── partners/                   # Partners page
├── payments/                   # Payment history + checkout
├── payouts/                    # Worker payout management
├── press/                      # Press / media
├── pricing/                    # Pricing tiers
├── profile/                    # Worker / employer profile
├── rating-appeals/             # Rating appeal system
├── referrals/                  # Referral programme
├── reports/                    # Reports & analytics
├── search/                     # Advanced search & filtering
├── services/                   # Service directory index
│   └── [service]/              # Service detail page
│       └── nz/
│           └── [region]/       # Region-level SEO landing pages
│               └── [city]/     # NZ city-level SEO pages
│       └── au/
│           └── [city]/         # AU city-level SEO pages
├── apprenticeships/            # Apprenticeship listings
│   └── [id]/                   # Apprenticeship detail
├── au/                         # Australia landing page
├── api-docs/                   # Public Partner API documentation
├── settings/                   # Account settings
├── stripe/                     # Stripe Connect onboarding
├── timesheets/                 # Per-job timesheet & cost tracker
└── workers/                    # Worker directory
```

---

## 💰 Revenue Model

| Stream | Detail |
|--------|--------|
| **Employer Free** | Post 1 job, view profiles |
| **Employer Pro** | $29/mo NZD — unlimited jobs, priority placement, direct messaging |
| **Employer Business** | $79/mo NZD — team accounts, bulk posting, API access |
| **Worker Commission** | 5% on completed jobs (taken at Stripe escrow release) |
| **Worker Pro Tier** | $19/mo NZD — boosted profile, AI writing, application analytics |
| **AI Writing Add-on** | $9.99 one-off — CV builder + AI cover letter generator |
| **Founders Deal** | Special early-access pricing for first 100 sign-ups |

---

## 🔍 SEO Architecture

| Element | Detail |
|---------|--------|
| **Canonical domain** | https://quicktrade.co.nz |
| **Sitemap** | /sitemap.xml (dynamic — services, cities, regions, blog) |
| **Service pages** | 17 NZ trades × 10 cities = 170 service×city pages |
| **Region pages** | /services/[service]/nz/[region] |
| **Blog** | MDX — 10+ posts on NZ trade topics |
| **JSON-LD types** | LocalBusiness, Service, FAQPage, BreadcrumbList, AggregateRating, Article |
| **OG images** | Dynamic per page type |
| **Twitter cards** | Configured |
| **Google Analytics** | GA4 installed |
| **Google Search Console** | Verified |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15.5.18 (App Router, RSC) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v3 |
| UI Components | shadcn/ui + Lucide React icons |
| Database | Firebase Firestore |
| Realtime | Firebase RTDB (chat + notifications) |
| Storage | Firebase Storage (avatars, photos, quote attachments) |
| Auth | Firebase Authentication (email + Google) |
| Payments | Stripe (Connect, webhooks, escrow) |
| Hosting | Vercel |
| MDX | @next/mdx |
| Analytics | Google Analytics 4 |
| SEO | Next.js Metadata API + JSON-LD |
| AI | OpenAI API (job matching, writing assistant, chatbot) |

---

## 🔑 Environment Variables

```bash
# Firebase (Client)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=

# Firebase (Admin SDK)
FIREBASE_SERVICE_ACCOUNT_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_APP_URL=https://quicktrade-pi.vercel.app
NEXT_PUBLIC_GA_ID=G-VNY47FMBTR

# AI
OPENAI_API_KEY=

# Email unsubscribe signing
UNSUBSCRIBE_SECRET=
```

---

## 🗂️ Key Files & Conventions

| File/Path | Purpose |
|-----------|---------|
| `lib/seo/config.ts` | `SITE_URL`, `SITE_NAME`, `SITE_DESCRIPTION` |
| `lib/services/servicesData.ts` | All 17 NZ trade service definitions |
| `lib/blog/posts.ts` | Blog post registry |
| `content/blog/` | MDX blog post files |
| `content/master-playbook.md` | Growth strategy & operations playbook |
| `components/quotes/` | Quote system components |
| `components/ui/` | shadcn/ui base components |
| `hooks/useCountdown.ts` | Quote expiry countdown hook |
| `types/index.ts` | All TypeScript interfaces |
| `app/api/` | All API route handlers |

**API auth pattern:** All API routes read `x-user-id` header (Firebase UID passed from authenticated client)

**Firestore collections:** `users`, `jobs`, `applications`, `quotes`, `reviews`, `messages`, `notifications`, `timesheets`, `invoices`, `disputes`, `payments`, `referrals`

**Firebase RTDB:** `chats/{conversationId}/messages`

**Firebase Storage paths:** `avatars/{userId}`, `reviews/{jobId}`, `quotes/{workerId}/{timestamp}/{filename}`

---

## 📅 PR History (Merged — Chronological)

### Foundation
| PR | Title |
|----|-------|
| #5 | fix: resolve TypeScript/ESLint errors blocking Vercel deployments |
| #13 | feat: Photo Reviews System with before/after galleries |
| #28 | Add missing Rating & Reviews system files |
| #29 | feat: Real-Time Notifications System |
| #30 | Add Advanced Search & Filtering System |
| #31 | Wire real Stripe + Firebase across all endpoints |
| #32 | feat: Payment & Billing System with Stripe integration |
| #34 | feat: Advanced Search & Filtering System |
| #35 | Add missing Payment & Billing API routes |
| #36 | feat: Real-Time Notifications & Messaging System |
| #38 | fix: PaymentForm broken API endpoints + payment method selector |
| #41/44 | Verify reviews route TypeScript compliance |
| #45 | feat: Reputation & Verification System with Mover Mode |
| #48 | Add bundle pricing (price anchoring) and Mover Mode |
| #49 | Implement Reputation & Verification System |
| #50 | Fix Next.js 14 build failures |
| #51 | feat: Complete Stripe webhook implementation |
| #52 | Implement payment system: invoice generation, dispute resolution |
| #53 | Worker onboarding: Stripe Connect, verification, profile completion |
| #54 | Implement job matching algorithm |
| #55 | feat: Comprehensive admin dashboard |
| #56 | Add Quotes & Estimates system |
| #57 | feat: Platform Profit Tracking & NZ GST Compliance |
| #58 | Task 8: Communication + Learning + Career Development System |
| #59 | TASK 9: Global Infrastructure — Multi-Country Tax, Currency, GDPR |
| #61 | Task 9.5: Growth & Intelligence system |
| #62 | Task 9.75: Trust & Mediation System |
| #63 | Add QTC earning and redemption systems |
| #64 | fix: rename dynamic route segments (Next.js slug conflict) |

### Design System & Brand
| PR | Title |
|----|-------|
| #66 | feat: Role-based dual-theme system |
| #67 | Replace gold/orange/amber with Platinum + Electric Indigo + Ice Blue |
| #68 | Theme naming cleanup + async params TS fixes |
| #82 | NZ-first UX: unified indigo icons, NZ placeholders, en-NZ locale |
| #83 | chore: delete /theme-comparison dev-only page |
| #84 | Restyle JobCard to unified indigo/slate design system |
| #86 | feat: dual-role toggle system (Worker ↔ Employer) |
| #87/88 | Fix icon-input overlap and TrustSignalBar on small screens |
| #89 | Brand rename: WorkerConnect → QuickTrade |
| #97 | Replace emoji icons with Lucide icons |
| #99/100 | Leaderboard: fix fuchsia card tint and yellow rewards banner |

### SEO & Public Pages
| PR | Title |
|----|-------|
| #69 | feat: NZ services landing pages + sitemap + structured data |
| #70/72 | Add Master Playbook to admin dashboard |
| #73/74 | NZ SEO system: 170 service×location pages, authority pages, sitemap |
| #76 | feat: add admin SEO dashboard at /admin/seo |
| #78 | feat: add public /pricing page |
| #80 | Add /help and /contact pages with fixed footer links |
| #81 | Add admin SEO operations dashboard |
| #85 | Rebuild /how-it-works as full premium dark page |

### Core App Features
| PR | Title |
|----|-------|
| #90/91 | Stripe integration + escrow payment system |
| #92/93 | Rebuild /pricing with full QuickTrade revenue model |
| #98 | feat: per-job timesheet & cost tracker |
| #101 | Lot 1: Auth Foundation — Firebase Auth with role-based redirects |
| #102 | Lot 2: Profile (Read) — live Firestore reads |
| #103 | Lot 3: Profile (Write) — edit form + avatar upload |
| #104 | Lot 4: Job Applications (Worker Side) |
| #105/106 | Lot 5: Job Applications (Employer Side) |
| #107 | Lot 6: In-app notification system (Firestore) |
| #109 | Lot 7: Real-time worker ↔ employer chat (Firebase RTDB) |
| #110 | Lot 8: Worker review system after job completion |
| #111 | Fix timesheets: role check fires before profile loads |
| #112 | Employment placement check-in system + rebuild pricing page |
| #113/114 | AI writing assistant with CV upload, subscription-gated |
| #115 | AI Writing Add-on ($9.99 one-off) |
| #116 | Welcome email, AI job categorisation, weekly job digest |
| #117 | SEO, Google ranking & luxury auth page polish |
| #118 | AI job matching, chatbot assistant, invoice emails |
| #120 | Add Google Search Console verification meta tag |
| #121 | Add Google Analytics tracking |
| #122 | Switch all hardcoded prices from USD to NZD |
| #123 | Homepage redesign: 4 clear user paths |
| #124 | Founders Deal landing page + dismissible homepage banner |
| #125 | Pricing page language sweep: NZ plain English |
| #126 | Move Timesheets from top nav into profile dropdown |
| #127 | Homepage hero: 2-step interactive expand layout |
| #128 | fix: Navbar trophy icon + replace region-specific SEO copy |
| #129 | Strip category emojis, declutter navbar, revamp leaderboard UI |
| #130 | Leaderboard full visual redesign |
| #131 | SEO: Fix canonical/sitemap domain + metadata on all public pages |
| #132 | Unify navbar and leaderboard avatar colours (indigo→violet) |
| #134 | Leaderboard card glows + Google SEO structured data |
| #135 | Rich SEO content (pricing, FAQs, JSON-LD) on service pages |
| #136 | Region-level SEO landing pages |
| #137 | LocalBusiness JSON-LD on service and city pages |
| #138 | OG Images, BreadcrumbList JSON-LD, About/Contact, AggregateRating |
| #139 | SEO: Twitter cards, MDX blog, internal linking, sitemap |
| #140 | SEO: 8 NZ cities added, real AggregateRating JSON-LD |
| #141 | Add 10 new NZ trade blog posts (MDX) |
| #143 | feat: Quote system upgrade — AI suggestions, attachments, counter-offers, stats, countdown, comparison |

---

## 🗺️ Roadmap — Next Priorities

### ✅ High Priority — All Shipped
| Feature | Notes |
|---------|-------|
| Worker verification badge | ID verification at /dashboard/worker/verify, badge on profile + worker cards |
| Push notifications (FCM) | FCM background + foreground push, permission prompt, service worker |
| Job completion flow | Worker requests → homeowner confirms → escrow releases → review |
| Stripe payout dashboard | /dashboard/worker/payout-setup + /payouts balance view + earnings dashboard reads live escrows |
| Employer business profile | /dashboard/business/profile (NZBN, logo, team) |
| Mobile PWA manifest + service worker | manifest.json + sw.js + firebase-messaging-sw.js |
| Worker availability calendar | /dashboard/worker/availability |
| Job booking system | /workers/[id]/book, /dashboard/worker/bookings |
| Public worker portfolio | Portfolio section on worker profile, /dashboard/worker/portfolio |
| Affiliate payout system | /api/affiliates + /dashboard/admin/affiliates |
| Rich job post editor | Category, urgency, budget type, save-as-template |
| Worker trade licences & certifications | /dashboard/worker/trade-licences, displayed on public profile |
| SMS notifications (Twilio) | Application events, payment released, booking confirmed |
| A/B test homepage hero CTA | Variant persisted in localStorage with analytics event tracking |

### 📋 Future / V2
- [x] Australian expansion (AUD, ABN, AU GST 10%) ✅
- [x] Video worker profiles ✅
- [x] Background check integration (NZ Police vetting API) ✅
- [x] Open API for partner integrations ✅
- [x] WorkSafe NZ compliance module ✅
- [x] Apprenticeship / training listings category ✅
- [x] Homeowner Spending Dashboard ✅
- [x] Homeowner Search Alerts management page ✅
- [x] Worker Subscription / Pro Tier management ✅
- [x] Worker Quote Templates (save + load in quote form) ✅
- [x] Mobile app (React Native / Expo) ✅ Initial Expo TypeScript scaffold at `/mobile`

---

## 📊 Project Metrics

| Metric | Value |
|--------|-------|
| Total PRs merged | 100+ |
| App pages/routes | 34+ top-level sections |
| NZ service×city SEO pages | 170+ |
| Blog posts | 10+ |
| Key integrations | Firebase, Stripe, OpenAI, Google Analytics |
| Active contributors | taylorirain96 + Copilot agent |

---

*This document is auto-updated. For the growth strategy and SEO playbook, see [content/master-playbook.md](content/master-playbook.md)*

# QuickTrade Master Playbook

> **Single source of truth** — Admin only. Update this file in the repo to keep the playbook current.

---

## Phase 1 — NZ Only (2–4 Weeks)

### Goal
Build a dense, credible presence in New Zealand before expanding to AU or US. Density beats spread at this stage.

### Checklist

- [ ] Pick **10–15 core services** (see taxonomy below — start with highest-search-demand categories)
- [ ] Pick **5–10 NZ cities / regions** (priority order: Blenheim, Auckland, Wellington, Christchurch, Hamilton, Tauranga, Dunedin, Nelson, Queenstown)
- [ ] Build SEO pages for every **service × location** combo (target: 50–200 pages)
- [ ] Ensure each page has a unique title, unique meta description, and a short unique intro paragraph
- [ ] Add canonical tags to every page
- [ ] Submit sitemap to Google Search Console
- [ ] Set `robots.txt` to allow all indexing
- [ ] Add JSON-LD structured data to every service + location page
- [ ] `noindex` any city/service page that has zero listings yet (flip to index once populated)
- [ ] Reach **20+ listings per hero page** before removing `noindex`
- [ ] Set up Google Business Profile for QuickTrade (service-area business in Blenheim/Marlborough)
- [ ] Push listings density and reviews on Blenheim pages first

### Phase 2 Preview (NZ Expands → AU)
- Double category coverage in NZ
- Add more NZ cities/regions
- Begin AU with "dense city first" strategy: Sydney → Melbourne → Brisbane
- Replicate the same sitemap + metadata + structured-data playbook per country

---

## Services Taxonomy — Premium 2-Level

### Top-Level Categories (8–12 max — keep homepage uncluttered)

| # | Category | Example Subcategories |
|---|----------|-----------------------|
| 1 | **Trades & Repairs** | Plumbing, Electrical, Heat pumps/HVAC, Roofing, Gasfitting, Drainlaying |
| 2 | **Home Improvement** | Painting, Flooring, Tiling, Carpentry, Kitchen reno, Bathroom reno |
| 3 | **Cleaning** | House cleaning, End-of-tenancy cleaning, Commercial cleaning, Window cleaning, Carpet cleaning |
| 4 | **Moving & Delivery** | House moving, Furniture delivery, Rubbish/junk removal, Storage |
| 5 | **Outdoor & Garden** | Landscaping, Lawn mowing, Tree trimming, Fencing, Irrigation, Pest control |
| 6 | **Auto Services** | Car detailing, Mobile mechanics, Windscreen, Tyres |
| 7 | **Tech Help** | IT support, CCTV/security, Smart home, Phone/laptop repair |
| 8 | **Personal Services** | Tutoring, Photography, Pet grooming, Errands |
| 9 | **Business Services** | Accounting, Graphic design, Signage, Cleaning contracts |
| 10 | **Events** | Photography, Catering, Hire, Styling |
| 11 | **Other** | Catch-all for new categories not yet above |

### Rules
- Subcategories become individual SEO pages over time (20–200+)
- Never show more than 8–12 top-level categories on the homepage
- Each subcategory slug becomes the canonical URL segment: `/services/plumbing`

---

## SEO Foundation Build

### URL Structure
```
/services                                  ← hub
/services/[service]                        ← e.g. /services/plumbing
/services/[service]/nz/[location]          ← e.g. /services/plumbing/nz/blenheim
```

### Page Requirements — Checklist

- [ ] `/services` hub page — clean premium grouped listing of all top-level categories
- [ ] `/services/[service]` — unique H1, description, internal links to locations
- [ ] `/services/[service]/nz/[location]` — unique H1 (`Plumbers in Blenheim`), unique intro, listing count, reviews teaser
- [ ] Every page: `<title>` tag unique (format: `Service in Location | QuickTrade`)
- [ ] Every page: `<meta name="description">` unique (≤160 chars, includes service + location + CTA)
- [ ] Every page: `<link rel="canonical">` points to itself
- [ ] Breadcrumbs on all service/location pages
- [ ] "Related services in [location]" internal links section
- [ ] "Nearby locations" internal links section (e.g. Blenheim → Picton, Renwick, Havelock)
- [ ] `sitemap.xml` includes all service + location pages, updated dynamically
- [ ] `robots.txt` — allow all; disallow `/api/`, `/admin/`, `/auth/`

### Metadata Templates

**Title format:**
```
{Service} in {Location} | QuickTrade NZ
```
Examples:
- `Plumbers in Blenheim | QuickTrade NZ`
- `House Cleaning in Wellington | QuickTrade NZ`

**Description format:**
```
Find trusted {service} professionals in {location}. Get quotes, read reviews, and hire fast on QuickTrade — New Zealand's premium services marketplace.
```

### JSON-LD Structured Data

Use `LocalBusiness` + `Service` + `areaServed` schema on every service/location page. Example:

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Plumbing",
  "areaServed": {
    "@type": "City",
    "name": "Blenheim",
    "containedInPlace": {
      "@type": "AdministrativeArea",
      "name": "Marlborough"
    }
  },
  "provider": {
    "@type": "Organization",
    "name": "QuickTrade",
    "url": "https://quicktrade.co.nz"
  }
}
```

**Rules for JSON-LD:**
- [ ] Always honest — only list real services/areas
- [ ] Do not list fake reviews or fabricated ratings
- [ ] Add `aggregateRating` only when real reviews exist
- [ ] Validate with Google's Rich Results Test before deploying

---

## Authority Signals — Rank Juice Plan

### What is "Rank Juice"?
When a trusted, high-authority website links to QuickTrade, it transfers a vote of confidence to your pages. Google treats this as a trust signal. The more quality links you earn, the higher QuickTrade climbs for competitive searches.

---

### Tier 1 — Best Juice (Local Media + Industry Links)

These links are hardest to get but move the needle most.

**Targets:**
- NZ regional news (Marlborough Express, Stuff regions, NZ Herald small business)
- Trade associations: BCITO, Master Plumbers NZ, ECANZ, Site Safe
- Supplier blogs, tool companies, insurance providers
- Apprenticeship / training organisations

**Assets they will link to (build these):**
- [ ] `/press` page — brand story, founder quote, launch regions, press contact, logo download
- [ ] `/reports/nz-home-services-price-index` — a link-magnet "report" page (start honest: "Early Edition based on QuickTrade data")
- [ ] Service + location pages once they have real content

**Action steps:**
- [ ] Write a "Blenheim founder launches QuickTrade" press release (use journalist pitch template below)
- [ ] Send to Marlborough Express, Stuff Marlborough, NZ Herald
- [ ] Pitch BCITO, Master Plumbers NZ for a directory listing or article mention

---

### Tier 2 — Good Juice, Fast (NZ Directories + Citations)

Not glamorous but important early on for local trust signals.

**NZ / Marlborough directories to list in:**
- [ ] Google Business Profile (most important — set up first)
- [ ] Yelp NZ
- [ ] NoCowboys.co.nz
- [ ] Neighbourly (Marlborough groups)
- [ ] Marlborough District Council business directory
- [ ] NZ Business Directory (nzbizz.co.nz or similar)
- [ ] Finda.co.nz
- [ ] Yellow Pages NZ (yellow.co.nz)
- [ ] Localist.co.nz

**Citation rules:**
- [ ] Use exactly the same business name, address, phone number (NAP) everywhere
- [ ] Use: `QuickTrade | [city], New Zealand | [phone] | quicktrade.co.nz`
- [ ] Track where you've listed using a spreadsheet (Name / URL / Date / Status)

---

### Tier 3 — Partner Backlinks (Scalable)

10–50 partners linking back to QuickTrade is a powerful compounding signal.

**How it works:**
1. Reach out to relevant local businesses (see partner outreach template below)
2. Offer them a "Proud Partner of QuickTrade" badge for their website
3. They link to QuickTrade → you link to their profile on QuickTrade

**Partner target types:**
- [ ] Property managers (big volume — they hire trades constantly)
- [ ] Cleaning companies, plumbers, electricians who want leads
- [ ] Local builders, landscapers, painters
- [ ] Coworking spaces / business hubs in Blenheim / Marlborough
- [ ] Tool suppliers and trade supply stores

**Build:**
- [ ] `/partners` page — explains partner program, shows partner logos, provides badge embed code
- [ ] Partner badge as PNG/SVG available for download
- [ ] `rel="nofollow"` is NOT needed for genuine business partners; use regular links

---

### Tier 4 — Internal Link Juice (100% Under Your Control)

This is often wasted. A well-linked site transfers authority across all its own pages.

**Internal linking checklist:**
- [ ] Hub pages (`/services`) link to all top-level category pages
- [ ] Category pages link to all location sub-pages
- [ ] Location pages link to nearby location pages ("Also in Marlborough: Picton, Renwick, Havelock")
- [ ] Location pages link to related categories ("Also in Blenheim: Cleaning, Moving, Landscaping")
- [ ] Breadcrumbs on every page (Home → Services → Plumbing → Blenheim)
- [ ] Footer includes links to top 10 services and top 5 NZ cities
- [ ] Blog/press posts link to relevant service + location pages

---

### What NOT To Do

Avoid these — they cause short spikes then long-term suppression:

- ❌ Buying Fiverr backlinks or "DA60+" link packages
- ❌ Private blog networks (PBNs)
- ❌ Automated comment/forum link blasting
- ❌ Keyword stuffing in page copy
- ❌ Duplicate/thin content across location pages (every page must have unique intro text)
- ❌ Fake reviews or fabricated star ratings in schema
- ❌ Cloaking or showing different content to Googlebot vs users

---

## Blenheim-First Launch Plan

### Why Blenheim First?
- Founder is based in Blenheim — authentic local story for press
- Smaller market = faster density + easier to dominate
- Marlborough is underserved by current platforms
- Local connections give unfair advantage for early partnerships + media

### 7-Day Blenheim Sprint

| Day | Action |
|-----|--------|
| 1 | Set up Google Business Profile for QuickTrade (service-area: Blenheim/Marlborough) |
| 1–2 | Submit to NoCowboys, Yelp NZ, Yellow Pages NZ, Finda.co.nz |
| 2–3 | Contact Marlborough Express and Stuff Marlborough with journalist pitch |
| 3–4 | Reach out to 5 local tradies/service providers for early listings + partnership |
| 4–5 | List in 10–20 NZ and Marlborough directories |
| 5–7 | Partner outreach to property managers and local businesses (5–10 contacts) |

### Key Blenheim Pages to Build (Priority)

- [ ] `/services/plumbing/nz/blenheim`
- [ ] `/services/electrical/nz/blenheim`
- [ ] `/services/cleaning/nz/blenheim`
- [ ] `/services/landscaping/nz/blenheim`
- [ ] `/services/painting/nz/blenheim`
- [ ] `/services/moving/nz/blenheim`
- [ ] `/services/handyman/nz/blenheim`
- [ ] `/services/heat-pumps/nz/blenheim`
- [ ] `/services/roofing/nz/blenheim`
- [ ] `/services/pest-control/nz/blenheim`

### Nearby Locations (Phase 1 expansion from Blenheim)
- Picton, Renwick, Havelock, Blenheim (Marlborough region)
- Then expand to: Nelson, Christchurch, Wellington, Auckland

---

## Templates

### Template 1 — Directory Listing Copy

> Use this for NoCowboys, Yelp, Yellow Pages, and any NZ business directory.

```
Business Name: QuickTrade

Category: Online Services Marketplace / Trades & Home Services

Short Description (≤160 chars):
QuickTrade connects New Zealanders with trusted local service providers — from plumbers to cleaners to landscapers. Get quotes fast.

Long Description:
QuickTrade is New Zealand's premium services marketplace, built to connect homeowners and businesses with verified local service providers across trades, home improvement, cleaning, moving, gardening, and more.

Based in Blenheim and launched NZ-wide, QuickTrade makes it easy to post a job, receive quotes, compare providers, and hire confidently — all in one place.

Whether you need a plumber in Blenheim, a cleaner in Wellington, or an electrician in Auckland, QuickTrade has you covered.

Website: https://quicktrade.co.nz
Location: Blenheim, Marlborough, New Zealand
Service Area: New Zealand-wide
Contact: [your email or phone]
```

---

### Template 2 — Partner Outreach Email

> Send to property managers, local tradespeople, and business owners.

```
Subject: QuickTrade Partnership — Free exposure for your business

Hi [Name],

I'm [Your Name], founder of QuickTrade — a new NZ services marketplace connecting local businesses like yours with customers who need your services.

I'd love to offer you a **free partner listing** on QuickTrade, which includes:
- A verified business profile visible to local customers
- A "Proud Partner of QuickTrade" badge for your website
- A direct link to your profile from our /partners page

In return, all I'd ask is that you add the QuickTrade badge to your website — it takes about 2 minutes.

QuickTrade is live in Blenheim/Marlborough right now and expanding across NZ over the next few months. Early partners get premium placement as the platform grows.

Interested? Reply to this email or visit [link] to set up your profile.

Thanks,
[Your Name]
QuickTrade | Blenheim, NZ
https://quicktrade.co.nz
```

---

### Template 3 — Journalist Pitch (Local Press)

> Send to Marlborough Express, Stuff Marlborough, Nelson Mail, NZ Herald small business desk.

```
Subject: Local founder launches QuickTrade — a new Blenheim-based services marketplace

Hi [Journalist Name],

I'm [Your Name], a Blenheim-based founder and I've just launched **QuickTrade**, a new online marketplace connecting New Zealanders with trusted local service providers.

**The story in brief:**
- QuickTrade is built to solve a real problem: finding reliable local tradies and service providers in NZ is still mostly word-of-mouth or old directories
- Blenheim is our launch city — we're starting local because we believe in backing Marlborough businesses
- The platform covers everything from plumbers to cleaners to landscapers, with verified profiles and real reviews

**Why it matters locally:**
- Marlborough service providers get a free, modern platform to reach more customers
- Marlborough residents get a trusted place to find and hire local help
- Every booking keeps money in the local economy

I'd love to offer you an exclusive first look, a quote, or a quick interview. Happy to meet in person in Blenheim.

Best,
[Your Name]
Founder, QuickTrade
[Phone] | [Email]
https://quicktrade.co.nz
```

---

*Last updated: April 2026 | Source of truth: `content/master-playbook.md`*

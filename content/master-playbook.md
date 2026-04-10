# QuickTrade Master Playbook

> Single source of truth for QuickTrade growth strategy, SEO, and operations.
> Last updated: April 2026

---

## Phase 1 — New Zealand Only (Weeks 1–4)

### Objective
Launch QuickTrade exclusively in New Zealand to validate the marketplace model before expanding internationally.

### Checklist
- [ ] Configure all landing copy, metadata, and CTAs to reference NZ locations
- [ ] Set `hreflang` or canonical signals for NZ-only launch
- [ ] Onboard first 10 workers in Blenheim/Marlborough (see Blenheim-first plan below)
- [ ] Set up services taxonomy (see below)
- [ ] Build SEO foundation (see below)
- [ ] Publish /press page
- [ ] Publish first /reports/ link-magnet page
- [ ] Launch /partners page with badge programme
- [ ] Connect UTM tracking and basic analytics dashboard

---

## Services Taxonomy — Premium 2-Level Approach

### Philosophy
Use clear top-level groups that map to real search intent, with specific subcategories that target long-tail keywords.

### Top-Level Groups & Subcategories

#### 🔧 Plumbing & Gas
- Leaking taps & pipes
- Hot water cylinder replacement
- Drain unblocking
- Gas fitting & certification
- Bathroom & kitchen plumbing

#### ⚡ Electrical
- General wiring & rewiring
- Switchboard upgrades
- EV charger installation
- LED lighting upgrades
- Safety inspections & certificates

#### ❄️ Heat Pumps & Air Conditioning
- Heat pump supply & installation
- Air conditioning installation (aircon)
- Heat pump servicing & maintenance
- Multi-head heat pump systems

#### 🔨 Handyman
- Flat-pack assembly
- Picture hanging & shelving
- Door & window repairs
- Tile repairs
- Minor carpentry

#### 🧹 Cleaning
- Regular house cleaning
- End-of-tenancy / bond cleaning
- Commercial office cleaning
- Carpet steam cleaning
- Window cleaning

#### 🚚 Moving & Removalists
- Local home moves
- Furniture-only moves
- Office relocations
- Packing & unpacking service

#### 🌿 Landscaping & Gardening
- Lawn mowing & maintenance
- Garden design & planting
- Tree trimming & removal
- Irrigation installation
- Hedge trimming

#### 🖌️ Painting
- Interior painting
- Exterior painting
- Wallpaper removal & prep
- Colour consultations

#### 🏠 Roofing
- Roof repairs & re-roofing
- Spouting & gutter replacement
- Roof inspections
- Iron roofing

#### 🪵 Flooring
- Timber floor installation & sanding
- Carpet installation
- Vinyl & LVP installation
- Tile & stone floors

#### 🔐 Locksmith
- Lockout service
- Lock replacement & rekeying
- Deadbolt installation
- Safe installation

#### 🐜 Pest Control
- Residential pest inspections
- Wasp & bee nest removal
- Rodent control
- Pre-purchase pest reports

#### 🗑️ Rubbish Removal
- General rubbish removal
- Green waste removal
- Hard rubbish / bulky items
- Construction debris removal

#### ⚙️ Appliance Repair
- Washing machine repair
- Dishwasher repair
- Oven & cooktop repair
- Refrigerator repair

#### 🚗 Car Detailing
- Full car detail (interior + exterior)
- Paint correction & ceramic coating
- Engine bay cleaning
- Fleet vehicle detailing

#### 🏗️ Plasterer
- Interior wall plastering
- Stopping & finishing
- Texture coat application
- Patch & repair plastering

#### 🏛️ Builder
- Home renovations & extensions
- Deck construction
- New builds (small projects)
- Garage & carport builds

---

## SEO Foundation Build

### Checklist
- [ ] Create `/services` hub page with links to all 17 service category pages
- [ ] Create 17 service pages at `/services/<slug>`
- [ ] Create 170 service+location pages at `/services/<service>/nz/<region>/<city>`
- [ ] Add unique `<title>` and `<meta name="description">` to every page
- [ ] Add `<link rel="canonical">` to every page
- [ ] Implement `app/sitemap.ts` covering all 188 pages (1 hub + 17 service + 170 location)
- [ ] Implement `app/robots.ts` (or `public/robots.txt`) allowing all crawlers and referencing sitemap
- [ ] Add JSON-LD structured data:
  - Service pages: `Service` schema with `name`, `description`, `provider`
  - Service+location pages: `LocalBusiness`/`Service` with `areaServed` (city + region)
- [ ] Verify internal linking mesh (service pages → all locations; location pages → nearby locations)
- [ ] Submit sitemap to Google Search Console

### URL Structure (LOCKED)

```
/services/
/services/<slug>
/services/<slug>/nz/<region>/<city>
```

**Examples:**
- `/services/` — hub page listing all 17 categories
- `/services/plumbing-gas` — service category page
- `/services/plumbing-gas/nz/marlborough/blenheim` — service + location page
- `/services/electrical/nz/nelson/nelson-city`

**Total pages: 188**
- 1 hub page
- 17 service category pages
- 170 service + location pages (17 services × 10 NZ cities)

---

## Blenheim-First Launch Plan

### Rationale
Blenheim/Marlborough is a strong launchpad: mid-sized regional city, tight-knit community, and underserved by existing platforms. Use it as a proof-of-concept before scaling to larger NZ cities.

### Checklist
- [ ] Source first 10 verified workers across top 5 services (plumbing, electrical, cleaning, handyman, heat pumps)
- [ ] Create worker profiles with photos and verified credentials
- [ ] Run a local Facebook/Instagram campaign targeting Blenheim homeowners
- [ ] List on local community noticeboards and Facebook groups
- [ ] Partner with 1–2 local suppliers (e.g. plumbing supplies) for referral network
- [ ] Collect first 10 real job completions and reviews
- [ ] Document learnings and iterate on worker onboarding flow

---

## Growth & Distribution Channels

### Checklist
- [ ] Google Business Profile for QuickTrade NZ
- [ ] Social proof loop: completed job → worker shares → employer leaves review → shown on landing page
- [ ] Referral programme (worker earns $X per referred worker who completes first job)
- [ ] Press outreach to NZ tech/business blogs (Idealog, Stuff Business, NBR)
- [ ] Link-magnet report: "Cost of home services in New Zealand 2026" (shareable PDF)
- [ ] Partner badge programme for verified QuickTrade workers (web + print)
- [ ] UTM tracking on all outbound links
- [ ] Weekly admin analytics review (conversion, CAC, activation rate)

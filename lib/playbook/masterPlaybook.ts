// Master Playbook — QuickTrade SEO & Authority Strategy
// Edit this file to update the playbook content rendered in /admin/playbook

export interface PlaybookCheckItem {
  id: string
  text: string
}

export interface PlaybookTemplate {
  id: string
  title: string
  content: string
}

export interface PlaybookSection {
  id: string
  title: string
  description?: string
  items?: PlaybookCheckItem[]
  subsections?: PlaybookSubsection[]
  templates?: PlaybookTemplate[]
}

export interface PlaybookSubsection {
  id: string
  title: string
  items?: PlaybookCheckItem[]
  note?: string
}

export const MASTER_PLAYBOOK: PlaybookSection[] = [
  {
    id: 'phase1',
    title: 'Phase 1 — NZ Only (2–4 weeks)',
    description: 'Start dense. Focus on Blenheim + major NZ cities before expanding.',
    items: [
      { id: 'p1-1', text: 'Pick 10–15 core service categories (plumbing, electrical, cleaning, moving, handyman, landscaping, painting, HVAC, roofing, junk removal, locksmith, pest control, appliance repair, car detailing, flooring)' },
      { id: 'p1-2', text: 'Pick 5–10 NZ locations: Blenheim/Marlborough (priority), Auckland, Wellington, Christchurch, Hamilton, Tauranga, Dunedin, Nelson, Queenstown' },
      { id: 'p1-3', text: 'Build ~100 SEO pages (10 services × 10 locations) using /services/[service]/nz/[location] routes' },
      { id: 'p1-4', text: 'Ensure each page has a unique title, meta description, H1, short intro paragraph, and internal links' },
      { id: 'p1-5', text: 'Add sitemap.ts that includes all service + location pages' },
      { id: 'p1-6', text: 'Confirm robots.ts is not blocking critical routes' },
      { id: 'p1-7', text: 'Add JSON-LD structured data (Service + AreaServed) to each service/location page' },
      { id: 'p1-8', text: 'Recruit enough providers so key pages are not empty (target 5–20 per city/service combo)' },
      { id: 'p1-9', text: 'Set up a "review ask" flow after completed jobs' },
      { id: 'p1-10', text: 'Set up Google Business Profile for QuickTrade (service-area business, Blenheim HQ)' },
      { id: 'p1-11', text: 'Submit to 10–30 NZ business directories (see Tier 2 below)' },
      { id: 'p1-12', text: 'Pitch 5 local Marlborough / Blenheim outlets with "local founder" story' },
      { id: 'p1-13', text: 'Get partner badges on 5 local businesses (property managers, suppliers, tradies)' },
    ],
  },
  {
    id: 'taxonomy',
    title: 'Services Taxonomy',
    description: '2-level taxonomy: 8–12 clean top-level groups, unlimited subcategories underneath.',
    subsections: [
      {
        id: 'tax-trades',
        title: 'Trades & Repairs',
        items: [
          { id: 'tr-1', text: 'Plumbing' },
          { id: 'tr-2', text: 'Electrical' },
          { id: 'tr-3', text: 'HVAC / Heat pumps' },
          { id: 'tr-4', text: 'Roofing' },
          { id: 'tr-5', text: 'Carpentry & Joinery' },
          { id: 'tr-6', text: 'Tiling' },
          { id: 'tr-7', text: 'Flooring' },
          { id: 'tr-8', text: 'Handyman' },
          { id: 'tr-9', text: 'Appliance Repair' },
          { id: 'tr-10', text: 'Locksmith' },
        ],
      },
      {
        id: 'tax-home',
        title: 'Home Improvement',
        items: [
          { id: 'hi-1', text: 'Painting & Decorating' },
          { id: 'hi-2', text: 'Kitchen Renovation' },
          { id: 'hi-3', text: 'Bathroom Renovation' },
          { id: 'hi-4', text: 'Insulation' },
          { id: 'hi-5', text: 'Plastering' },
          { id: 'hi-6', text: 'Concreting & Paving' },
        ],
      },
      {
        id: 'tax-cleaning',
        title: 'Cleaning',
        items: [
          { id: 'cl-1', text: 'House Cleaning' },
          { id: 'cl-2', text: 'End-of-Tenancy Cleaning' },
          { id: 'cl-3', text: 'Carpet Cleaning' },
          { id: 'cl-4', text: 'Window Cleaning' },
          { id: 'cl-5', text: 'Commercial Cleaning' },
          { id: 'cl-6', text: 'Gutter Cleaning' },
        ],
      },
      {
        id: 'tax-moving',
        title: 'Moving & Delivery',
        items: [
          { id: 'mv-1', text: 'House Moving' },
          { id: 'mv-2', text: 'Furniture Removal' },
          { id: 'mv-3', text: 'Junk / Rubbish Removal' },
          { id: 'mv-4', text: 'Courier & Delivery' },
        ],
      },
      {
        id: 'tax-outdoor',
        title: 'Outdoor & Garden',
        items: [
          { id: 'od-1', text: 'Landscaping' },
          { id: 'od-2', text: 'Lawn Mowing' },
          { id: 'od-3', text: 'Tree Services' },
          { id: 'od-4', text: 'Fencing' },
          { id: 'od-5', text: 'Irrigation' },
          { id: 'od-6', text: 'Pest Control' },
        ],
      },
      {
        id: 'tax-auto',
        title: 'Auto Services',
        items: [
          { id: 'au-1', text: 'Car Detailing' },
          { id: 'au-2', text: 'Mobile Mechanic' },
          { id: 'au-3', text: 'Tyre Fitting' },
          { id: 'au-4', text: 'WOF Preparation' },
        ],
      },
      {
        id: 'tax-tech',
        title: 'Tech Help',
        items: [
          { id: 'th-1', text: 'Computer Repair' },
          { id: 'th-2', text: 'IT Support' },
          { id: 'th-3', text: 'Smart Home Setup' },
          { id: 'th-4', text: 'CCTV / Security Install' },
        ],
      },
      {
        id: 'tax-personal',
        title: 'Personal Services',
        items: [
          { id: 'ps-1', text: 'Pet Care & Dog Walking' },
          { id: 'ps-2', text: 'Tutoring' },
          { id: 'ps-3', text: 'Beauty & Wellness' },
          { id: 'ps-4', text: 'Personal Training' },
        ],
      },
      {
        id: 'tax-business',
        title: 'Business Services',
        items: [
          { id: 'bs-1', text: 'Bookkeeping' },
          { id: 'bs-2', text: 'Virtual Admin' },
          { id: 'bs-3', text: 'Photography & Videography' },
          { id: 'bs-4', text: 'Graphic Design' },
        ],
      },
      {
        id: 'tax-events',
        title: 'Events',
        items: [
          { id: 'ev-1', text: 'Event Setup & Teardown' },
          { id: 'ev-2', text: 'Catering Assistance' },
          { id: 'ev-3', text: 'DJ & Entertainment' },
        ],
      },
    ],
  },
  {
    id: 'seo-foundation',
    title: 'SEO Foundation Build',
    description: 'Technical SEO must-haves that allow Google to crawl, understand, and rank your pages.',
    items: [
      { id: 'seo-1', text: 'Create /services hub page (clean, premium, grouped by category)' },
      { id: 'seo-2', text: 'Create /services/[service] pages (e.g. /services/plumbing)' },
      { id: 'seo-3', text: 'Create /services/[service]/nz/[location] pages (e.g. /services/plumbing/nz/blenheim)' },
      { id: 'seo-4', text: 'Unique <title> and <meta description> per route (App Router metadata export)' },
      { id: 'seo-5', text: 'OpenGraph + Twitter card metadata on all public pages' },
      { id: 'seo-6', text: 'app/sitemap.ts — include homepage, services hub, all service pages, all location pages' },
      { id: 'seo-7', text: 'app/robots.ts — allow Googlebot, disallow /api/, /auth/, /admin/' },
      { id: 'seo-8', text: 'JSON-LD structured data on each service page: Service schema + AreaServed = NZ city' },
      { id: 'seo-9', text: 'Breadcrumb JSON-LD on location pages (Home > Services > Plumbing > Blenheim)' },
      { id: 'seo-10', text: 'Internal links: hub → service → service+location → "nearby locations" + "related services"' },
      { id: 'seo-11', text: 'Canonical tags set correctly (no duplicate content)' },
      { id: 'seo-12', text: 'Page speed: images optimised with next/image, no layout shift, minimal JS on landing pages' },
      { id: 'seo-13', text: 'Use noindex on empty pages until they have real listings (then flip to index)' },
    ],
  },
  {
    id: 'authority',
    title: 'Authority Signals / Rank Juice Plan',
    description: 'Off-site signals that tell Google you are trusted and worth ranking above competitors.',
    subsections: [
      {
        id: 'auth-press',
        title: 'Press Page (/press)',
        items: [
          { id: 'pr-1', text: 'Build a /press page with: company overview, founder bio (Blenheim NZ), key stats, downloadable press kit (logo + brand guide)' },
          { id: 'pr-2', text: 'Add press@quicktrade.nz email address (or contact form)' },
          { id: 'pr-3', text: 'Keep an "As Seen In" section — even one local mention counts early on' },
          { id: 'pr-4', text: 'Pitch angle: "Blenheim founder builds verified-trades marketplace to fix NZ\'s tradesperson shortage"' },
        ],
      },
      {
        id: 'auth-link-targets',
        title: 'Services + Location Pages as Link Targets',
        items: [
          { id: 'lt-1', text: 'Each service/location page is a "linkable asset" — make sure copy is genuinely useful (not thin)' },
          { id: 'lt-2', text: 'Add a "local stats" sidebar widget per location (e.g. average plumbing cost in Blenheim)' },
          { id: 'lt-3', text: 'Add FAQ section per service (also helps with People Also Ask / voice search)' },
        ],
      },
      {
        id: 'auth-stats',
        title: 'Stats / Report Link Magnet Page (/nz-services-report)',
        items: [
          { id: 'st-1', text: 'Publish an annual "NZ Home Services Price Index" using your own platform data' },
          { id: 'st-2', text: 'Include: average cost per service by city, demand trends, most booked services' },
          { id: 'st-3', text: 'Pitch to Stuff, NZ Herald Small Business, local bloggers, property management blogs' },
          { id: 'st-4', text: 'Update yearly — the URL stays the same, links accumulate' },
        ],
      },
      {
        id: 'auth-partners',
        title: 'Partners Page + Partner Badge (/partners)',
        items: [
          { id: 'pa-1', text: 'Build /partners page listing partner businesses (property managers, tool suppliers, trade schools)' },
          { id: 'pa-2', text: 'Create "Proud Partner of QuickTrade" badge kit (PNG + embed code)' },
          { id: 'pa-3', text: 'Each partner embeds the badge on their website → link back to QuickTrade' },
          { id: 'pa-4', text: 'Start with 5–10 Blenheim/Marlborough businesses, expand NZ-wide' },
          { id: 'pa-5', text: 'Target: property managers, hardware stores, trade training orgs (BCITO, etc.)' },
        ],
      },
      {
        id: 'auth-tracking',
        title: 'Tracking (UTMs + Optional Redirects)',
        items: [
          { id: 'tr-1', text: 'Tag all outbound directory/press links with UTM params: utm_source=directory&utm_medium=citation&utm_campaign=nz-local' },
          { id: 'tr-2', text: 'Create short redirect URLs for partner badges (e.g. /go/partner-badge → /partners)' },
          { id: 'tr-3', text: 'Set up Google Analytics 4 goals: new user registration, job posted, job applied' },
          { id: 'tr-4', text: 'Track which referral sources convert best and double down on those channels' },
        ],
      },
      {
        id: 'auth-tiers',
        title: 'Link Acquisition Tiers',
        subsections: [
          {
            id: 'tier1',
            title: 'Tier 1 — Best Juice (Local Media + Industry)',
            items: [
              { id: 't1-1', text: 'Stuff.co.nz regional (Marlborough Express, Nelson Mail)' },
              { id: 't1-2', text: 'NZ Herald Small Business section' },
              { id: 't1-3', text: 'Trade associations: BCITO, Master Plumbers NZ, ECANZ, NZ Master Builders' },
              { id: 't1-4', text: 'Trade insurance providers (e.g. Trades Mutual, BrokerLink)' },
              { id: 't1-5', text: 'Tool/hardware suppliers (Mitre 10, PlaceMakers, Bunnings NZ trade blog)' },
            ],
          },
          {
            id: 'tier2',
            title: 'Tier 2 — Good Juice (NZ Directories + Citations)',
            items: [
              { id: 't2-1', text: 'Google Business Profile (verified, complete, photos)' },
              { id: 't2-2', text: 'Finda.co.nz' },
              { id: 't2-3', text: 'NoCowboys.co.nz' },
              { id: 't2-4', text: 'Yellow Pages NZ (yellow.co.nz)' },
              { id: 't2-5', text: 'Yelp NZ' },
              { id: 't2-6', text: 'Tradespeople.co.nz' },
              { id: 't2-7', text: 'Marlborough Chamber of Commerce' },
              { id: 't2-8', text: 'Blenheim Business Community listings' },
              { id: 't2-9', text: 'NZ Business Directory (nzbizbuysell.co.nz)' },
              { id: 't2-10', text: 'Neighbourly.co.nz (local community platform)' },
            ],
          },
          {
            id: 'tier3',
            title: 'Tier 3 — Compounding Juice (Partner Backlinks)',
            items: [
              { id: 't3-1', text: 'Property managers (they hire tradies constantly, great referral + link)' },
              { id: 't3-2', text: 'Cleaning companies, plumbers, electricians who want leads' },
              { id: 't3-3', text: 'Local builders / developers' },
              { id: 't3-4', text: 'Coworking spaces & business hubs (Nelson, Blenheim)' },
              { id: 't3-5', text: 'Real estate agencies (RE/MAX, Harcourts Marlborough)' },
            ],
          },
          {
            id: 'tier4',
            title: 'Tier 4 — Foundational Juice (Internal Linking)',
            items: [
              { id: 't4-1', text: 'Hub page (/services) links to all top-level category pages' },
              { id: 't4-2', text: 'Category pages link to all location pages within that category' },
              { id: 't4-3', text: 'Each location page has "Related services in [city]" section' },
              { id: 't4-4', text: 'Each location page has "Nearby areas" links (Blenheim → Picton, Renwick, Havelock)' },
              { id: 't4-5', text: 'Breadcrumb nav on all deep pages (also rendered as JSON-LD)' },
            ],
          },
        ],
      },
      {
        id: 'auth-donts',
        title: 'What NOT to Do',
        note: 'These tactics cause short spikes then long-term suppression (Google will penalise you).',
        items: [
          { id: 'nd-1', text: '❌ Do NOT buy random Fiverr / cheap backlink packages' },
          { id: 'nd-2', text: '❌ Do NOT use Private Blog Networks (PBNs)' },
          { id: 'nd-3', text: '❌ Do NOT use automated comment/forum spam tools' },
          { id: 'nd-4', text: '❌ Do NOT create thin/duplicate pages (publish empty location pages with noindex until ready)' },
          { id: 'nd-5', text: '❌ Do NOT use keyword stuffing in page copy or meta tags' },
          { id: 'nd-6', text: '❌ Do NOT exchange links in a "link circle" (A→B→C→A — Google detects patterns)' },
        ],
      },
    ],
  },
  {
    id: 'blenheim-launch',
    title: 'Blenheim-First Launch Plan',
    description: 'You live in Blenheim NZ — that\'s a strategic advantage. Own the local market first, then expand.',
    items: [
      { id: 'bl-1', text: 'Create /services/[service]/nz/blenheim pages for top 10 services first' },
      { id: 'bl-2', text: 'Recruit 5–10 verified providers in each core category in Blenheim/Marlborough' },
      { id: 'bl-3', text: 'Set up Google Business Profile with Blenheim/Marlborough service area' },
      { id: 'bl-4', text: 'Personally reach out to 20 local tradies and offer free early access (build supply density)' },
      { id: 'bl-5', text: 'Pitch Marlborough Express with "local startup" angle — get a mention/link' },
      { id: 'bl-6', text: 'Attend 1–2 Blenheim Business Network / Chamber of Commerce events (face-to-face trust)' },
      { id: 'bl-7', text: 'Get listed in Marlborough Chamber of Commerce directory' },
      { id: 'bl-8', text: 'Offer a "Blenheim Founding Partners" badge to the first 10 businesses who partner with you' },
      { id: 'bl-9', text: 'Add "Proudly based in Blenheim, NZ" to footer/press page (local trust signal)' },
      { id: 'bl-10', text: 'Once Blenheim has density (20+ providers, first reviews), expand to Nelson, then Christchurch' },
    ],
  },
  {
    id: 'templates',
    title: 'Templates',
    description: 'Copy-paste templates for directories, partner outreach, and press pitches.',
    templates: [
      {
        id: 'tpl-directory',
        title: 'Directory Listing Copy Template',
        content: `Business Name: QuickTrade

Category: Online Marketplace / Home Services / Trades

Short Description (50 words):
QuickTrade connects verified tradespeople and local service providers with homeowners and businesses across New Zealand. Find trusted plumbers, electricians, cleaners, movers, and more — all verified and rated by real customers. Post a job or hire today.

Long Description (150 words):
QuickTrade is New Zealand's trusted marketplace for local services and skilled trades. We make it easy to find and hire verified professionals across 50+ service categories including plumbing, electrical, cleaning, moving, landscaping, HVAC, painting, and more.

Every provider on QuickTrade is identity-verified and rated by real customers, so you always know who's coming to your home or business. Whether you need a one-off repair or a long-term service contract, QuickTrade matches you with the right person for the job — fast.

Founded in Blenheim, NZ, QuickTrade is built for Kiwis. We support tradespeople across New Zealand to grow their business and take control of their schedule.

Website: https://quicktrade.co.nz
Phone: [your phone]
Email: hello@quicktrade.co.nz
Address: Blenheim, Marlborough 7201, New Zealand
Service Area: New Zealand (NZ, AU, US)
Founded: 2024`,
      },
      {
        id: 'tpl-partner',
        title: 'Partner Outreach Email Template',
        content: `Subject: Partnership opportunity — QuickTrade x [Their Business Name]

Hi [First Name],

I'm [Your Name], founder of QuickTrade — a new NZ marketplace that connects verified tradespeople and service providers with homeowners and businesses.

I noticed [Their Business Name] works with a lot of [property owners / homeowners / tradies], and I think there's a great fit here.

Here's what I'm proposing:
- We list [Their Business Name] on our Partners page (a permanent, do-follow link back to your site)
- In return, you display our "QuickTrade Trusted Partner" badge on your website/emails (a link back to us)
- We can also refer clients your way when they need [relevant service]

This is completely free — it's a genuine mutual referral arrangement, not a paid scheme.

QuickTrade is brand new and growing fast. Getting in early means you'll be featured prominently on our Partners page as one of our founding Marlborough partners.

Would you be open to a quick 10-minute call this week?

Thanks,
[Your Name]
Founder, QuickTrade
[Phone] | hello@quicktrade.co.nz | quicktrade.co.nz`,
      },
      {
        id: 'tpl-journalist',
        title: 'Journalist Pitch Template (Blenheim Founder Angle)',
        content: `Subject: Local story: Blenheim founder launches NZ's first verified-trades marketplace

Hi [Journalist First Name],

I'm reaching out with a local angle I think your readers will find interesting.

My name is [Your Name] and I'm a Blenheim-based founder. I've just launched QuickTrade (quicktrade.co.nz) — a marketplace that connects New Zealanders with verified tradespeople and local service providers.

Why this is relevant to your readers:
- NZ has a serious tradesperson shortage — QuickTrade helps homeowners find trusted, verified providers without the risk of hiring someone dodgy off Facebook
- It was built right here in Marlborough, by a local — not a Silicon Valley startup
- Early data shows [X providers signed up / X jobs posted] in the first [X] weeks

The angle I'd love to offer you:
A short feature on how a Blenheim local is trying to solve a national problem — the difficulty of finding reliable tradespeople — with a platform built for Kiwis.

I'm happy to do an interview (in person in Blenheim or by phone), provide photos, and share any stats you need.

Is this something you'd be interested in covering?

Best regards,
[Your Name]
Founder, QuickTrade
[Phone] | [Your Name]@quicktrade.co.nz | quicktrade.co.nz`,
      },
    ],
  },
]

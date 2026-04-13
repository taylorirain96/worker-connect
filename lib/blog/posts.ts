export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  readTime: string
  category: string
}

const posts: BlogPost[] = [
  {
    slug: 'how-much-does-a-plumber-cost-in-nz',
    title: 'How Much Does a Plumber Cost in New Zealand? (2025 Guide)',
    description: 'Complete guide to plumber costs in NZ. Average prices, what affects cost, and how to get the best quotes.',
    date: '2025-04-01',
    readTime: '5 min read',
    category: 'Cost Guides',
  },
  {
    slug: 'best-electricians-auckland',
    title: 'How to Find a Licensed Electrician in Auckland',
    description: 'What to look for when hiring an electrician in Auckland — licensing, costs, and how to get the best deal.',
    date: '2025-04-05',
    readTime: '4 min read',
    category: 'Hiring Guides',
  },
  {
    slug: 'how-to-hire-a-builder-new-zealand',
    title: 'How to Hire a Builder in New Zealand: The Complete Guide',
    description: 'Everything you need to know about hiring a builder in NZ — LBP requirements, contracts, quotes, and costs.',
    date: '2025-04-08',
    readTime: '6 min read',
    category: 'Hiring Guides',
  },
  {
    slug: 'heat-pump-installation-cost-nz',
    title: 'Heat Pump Installation Cost in NZ: 2026 Pricing Guide',
    description: 'How much does a heat pump cost to install in New Zealand? Average prices, brand comparisons, and Warmer Kiwi Homes subsidy info.',
    date: '2026-04-07',
    readTime: '5 min read',
    category: 'Cost Guides',
  },
  {
    slug: 'house-cleaning-cost-nz',
    title: 'How Much Does House Cleaning Cost in New Zealand? (2026)',
    description: 'House cleaning prices in NZ — what cleaners charge per hour, what affects the cost, and how to find a reliable cleaner near you.',
    date: '2026-04-08',
    readTime: '4 min read',
    category: 'Cost Guides',
  },
  {
    slug: 'roof-repair-cost-nz',
    title: 'Roof Repair Cost in NZ: What to Expect in 2026',
    description: 'A complete guide to roof repair costs in New Zealand. Minor repairs, full replacements, iron vs tile — with real price ranges.',
    date: '2026-04-09',
    readTime: '5 min read',
    category: 'Cost Guides',
  },
  {
    slug: 'painters-wellington',
    title: 'How to Find a Good Painter in Wellington (2026 Guide)',
    description: 'Tips for hiring a painter in Wellington — what to look for, typical costs, and how to get the best quote for interior or exterior painting.',
    date: '2026-04-10',
    readTime: '4 min read',
    category: 'Hiring Guides',
  },
  {
    slug: 'plumbers-christchurch',
    title: 'Finding a Reliable Plumber in Christchurch: The Essential Guide',
    description: 'How to hire a licensed plumber in Christchurch. What plumbing jobs cost, what to check before booking, and how to avoid cowboy tradies.',
    date: '2026-04-11',
    readTime: '4 min read',
    category: 'Hiring Guides',
  },
  {
    slug: 'landscaping-cost-nz',
    title: 'Landscaping Costs in NZ: How Much Should You Pay? (2026)',
    description: 'Garden design, lawn mowing, retaining walls, irrigation — a full breakdown of landscaping and gardening costs in New Zealand.',
    date: '2026-04-12',
    readTime: '5 min read',
    category: 'Cost Guides',
  },
  {
    slug: 'electricians-hamilton',
    title: 'How to Find a Licensed Electrician in Hamilton',
    description: 'What to look for when hiring an electrician in Hamilton — licensing requirements, typical costs, and common electrical jobs.',
    date: '2026-04-13',
    readTime: '4 min read',
    category: 'Hiring Guides',
  },
  {
    slug: 'handyman-services-auckland',
    title: 'Handyman Services in Auckland: Costs, Tips & How to Book',
    description: 'Everything you need to know about hiring a handyman in Auckland. Typical hourly rates, what jobs they can do, and how to get a quote.',
    date: '2026-04-14',
    readTime: '4 min read',
    category: 'Hiring Guides',
  },
  {
    slug: 'how-to-hire-a-plasterer-nz',
    title: 'How to Hire a Plasterer in New Zealand: Costs & What to Expect',
    description: 'Guide to hiring a plasterer in NZ — gib stopping, crack repairs, full plastering jobs. What it costs and what questions to ask.',
    date: '2026-04-15',
    readTime: '4 min read',
    category: 'Hiring Guides',
  },
  {
    slug: 'moving-house-nz-checklist',
    title: 'Moving House in New Zealand: The Complete Checklist (2026)',
    description: 'Everything you need to do before, during, and after moving house in NZ. Removalist tips, costs, and how to make moving day stress-free.',
    date: '2026-04-16',
    readTime: '6 min read',
    category: 'Guides',
  },
]

export function getAllPosts(): BlogPost[] {
  return posts
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug)
}

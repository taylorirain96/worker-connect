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
    title: 'Heat Pump Installation Cost in NZ: 2025 Price Guide',
    description: 'How much does it cost to install a heat pump in New Zealand? Complete price guide covering brands, sizes, installation costs and the Warmer Kiwi Homes subsidy.',
    date: '2025-04-10',
    readTime: '5 min read',
    category: 'Cost Guides',
  },
  {
    slug: 'house-cleaning-cost-nz',
    title: 'How Much Does House Cleaning Cost in NZ? (2025 Guide)',
    description: 'House cleaning prices in New Zealand — what you\'ll pay for regular, deep, and end-of-tenancy cleans in 2025.',
    date: '2025-04-11',
    readTime: '4 min read',
    category: 'Cost Guides',
  },
  {
    slug: 'roof-repair-cost-nz',
    title: 'Roof Repair Costs in NZ: What to Expect in 2025',
    description: 'From minor leaks to full replacements — a complete guide to roof repair costs in New Zealand, including iron, tile and flat roofs.',
    date: '2025-04-12',
    readTime: '5 min read',
    category: 'Cost Guides',
  },
  {
    slug: 'painters-wellington',
    title: 'Finding a Painter in Wellington: Costs, Tips & What to Ask',
    description: 'Looking for a painter in Wellington? Here\'s what you\'ll pay, what questions to ask, and how to find a reliable local painter.',
    date: '2025-04-12',
    readTime: '4 min read',
    category: 'Local Guides',
  },
  {
    slug: 'plumbers-christchurch',
    title: 'Plumbers in Christchurch: How to Find One & What It Costs',
    description: 'Need a plumber in Christchurch? Find out what plumbers charge in Canterbury, what jobs they do, and how to book fast on QuickTrade.',
    date: '2025-04-13',
    readTime: '4 min read',
    category: 'Local Guides',
  },
  {
    slug: 'landscaping-cost-nz',
    title: 'Landscaping Costs in New Zealand: Full Price Guide (2025)',
    description: 'How much does landscaping cost in NZ? From lawn mowing to full garden makeovers — complete pricing guide for 2025.',
    date: '2025-04-13',
    readTime: '5 min read',
    category: 'Cost Guides',
  },
  {
    slug: 'electricians-hamilton',
    title: 'Electricians in Hamilton: Costs, Licensing & How to Book',
    description: 'Looking for an electrician in Hamilton? Find out what registered electricians charge in Waikato and how to hire safely.',
    date: '2025-04-13',
    readTime: '4 min read',
    category: 'Local Guides',
  },
  {
    slug: 'handyman-services-auckland',
    title: 'Handyman Services in Auckland: What They Cost & How to Find One',
    description: 'Need a handyman in Auckland? Here\'s what handymen charge in Auckland, what jobs they can do, and how to find a reliable one fast.',
    date: '2025-04-13',
    readTime: '4 min read',
    category: 'Local Guides',
  },
  {
    slug: 'how-to-hire-a-plasterer-nz',
    title: 'How to Hire a Plasterer in New Zealand: Costs & What to Know',
    description: 'Everything you need to know about hiring a plasterer in NZ — gib stopping, crack repairs, costs and how to get the best finish.',
    date: '2025-04-13',
    readTime: '4 min read',
    category: 'Hiring Guides',
  },
  {
    slug: 'moving-house-nz-checklist',
    title: 'Moving House in NZ: Complete Checklist & Removalist Costs (2025)',
    description: 'Moving house in New Zealand? Our complete checklist covers everything from booking removalists to changing your address — plus what it costs.',
    date: '2025-04-13',
    readTime: '6 min read',
    category: 'Hiring Guides',
  },
]

export function getAllPosts(): BlogPost[] {
  return posts
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug)
}

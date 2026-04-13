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
]

export function getAllPosts(): BlogPost[] {
  return posts
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug)
}

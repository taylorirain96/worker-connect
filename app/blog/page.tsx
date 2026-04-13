import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { getAllPosts } from '@/lib/blog/posts'
import { SITE_URL } from '@/lib/seo/config'

export const metadata: Metadata = {
  title: 'Trade Tips & Cost Guides | QuickTrade NZ',
  description:
    'Helpful guides and cost breakdowns for hiring tradespeople in New Zealand — plumbers, electricians, builders and more.',
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: 'Trade Tips & Cost Guides | QuickTrade NZ',
    description:
      'Helpful guides and cost breakdowns for hiring tradespeople in New Zealand — plumbers, electricians, builders and more.',
    url: `${SITE_URL}/blog`,
    type: 'website',
  },
}

export default function BlogIndexPage() {
  const posts = getAllPosts()

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
    ],
  }

  return (
    <div className="flex flex-col min-h-screen luxury-bg">
      <Script
        id="jsonld-blog-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Navbar />

      {/* Hero */}
      <section
        className="relative py-20 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0a0f1e 0%, #111827 60%, #0a0f1e 100%)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(99,102,241,0.2) 0%, transparent 70%)',
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-sm text-indigo-400 mb-6">
            Trade Tips &amp; Cost Guides
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Know Before You Hire
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Practical guides to help New Zealanders hire the right tradesperson at the right price.
          </p>
        </div>
      </section>

      {/* Posts grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-indigo-500/50 transition-all duration-200"
            >
              <div className="p-6 flex flex-col h-full">
                <div className="mb-3">
                  <span className="inline-block bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-medium px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                </div>
                <h2 className="text-white font-bold text-lg mb-2 group-hover:text-indigo-300 transition-colors line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed flex-1 mb-4">
                  {post.description}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500 mt-auto">
                  <span>{new Date(post.date).toLocaleDateString('en-NZ', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <span>{post.readTime}</span>
                </div>
                <div className="mt-4 text-indigo-400 text-sm font-medium group-hover:text-indigo-300 transition-colors">
                  Read guide →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}

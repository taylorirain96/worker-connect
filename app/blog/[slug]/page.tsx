import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Script from 'next/script'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { getAllPosts, getPostBySlug } from '@/lib/blog/posts'
import { SITE_URL } from '@/lib/seo/config'

interface Props {
  params: { slug: string }
}

const mdxModules: Record<string, () => Promise<{ default: React.ComponentType }>> = {
  'how-much-does-a-plumber-cost-in-nz': () =>
    import('@/content/blog/how-much-does-a-plumber-cost-in-nz.mdx'),
  'best-electricians-auckland': () =>
    import('@/content/blog/best-electricians-auckland.mdx'),
  'how-to-hire-a-builder-new-zealand': () =>
    import('@/content/blog/how-to-hire-a-builder-new-zealand.mdx'),
}

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPostBySlug(params.slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `${SITE_URL}/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${SITE_URL}/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.date,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const post = getPostBySlug(params.slug)
  if (!post) notFound()

  const loader = mdxModules[params.slug]
  if (!loader) notFound()

  const { default: MDXContent } = await loader()

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      '@type': 'Organization',
      name: 'QuickTrade NZ',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'QuickTrade NZ',
      url: SITE_URL,
    },
    url: `${SITE_URL}/blog/${post.slug}`,
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: `${SITE_URL}/blog/${post.slug}` },
    ],
  }

  return (
    <div className="flex flex-col min-h-screen luxury-bg">
      <Script
        id="jsonld-article"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Script
        id="jsonld-post-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Navbar />

      {/* Article header */}
      <section
        className="relative py-16 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0a0f1e 0%, #111827 60%, #0a0f1e 100%)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 70%)',
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-slate-300 transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-slate-400 truncate">{post.title}</span>
          </nav>
          <span className="inline-block bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-medium px-3 py-1 rounded-full mb-4">
            {post.category}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{post.title}</h1>
          <p className="text-slate-400 text-lg mb-6">{post.description}</p>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span>{new Date(post.date).toLocaleDateString('en-NZ', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span>·</span>
            <span>{post.readTime}</span>
          </div>
        </div>
      </section>

      {/* MDX content */}
      <section className="py-12 px-4 sm:px-6 max-w-3xl mx-auto w-full">
        <article className="prose prose-invert prose-indigo max-w-none prose-headings:text-white prose-p:text-slate-300 prose-strong:text-white prose-a:text-indigo-400 hover:prose-a:text-indigo-300 prose-table:text-slate-300 prose-th:text-white prose-blockquote:border-indigo-500 prose-blockquote:text-slate-400">
          <MDXContent />
        </article>
      </section>

      {/* CTA */}
      <section
        className="py-16 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #111827 100%)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(99,102,241,0.25) 0%, transparent 70%)',
          }}
        />
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to Get Quotes?
          </h2>
          <p className="text-slate-400 mb-8">
            Post your job on QuickTrade and receive competitive quotes from verified local tradespeople — free, fast, and no obligation.
          </p>
          <Link
            href="/jobs/create"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Post Your Job Free →
          </Link>
          <div className="mt-4">
            <Link href="/blog" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
              ← Back to all guides
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

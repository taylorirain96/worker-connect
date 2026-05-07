import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { Key, Code, Shield, ExternalLink, BookOpen } from 'lucide-react'

export const metadata: Metadata = {
  title: 'API Documentation | QuickTrade Partners',
  description:
    'QuickTrade Partner API — integrate NZ trade job listings and worker profiles into your application.',
}

const BASE_URL = 'https://quicktrade-pi.vercel.app'

const ENDPOINTS = [
  {
    method: 'GET',
    path: '/api/jobs',
    description: 'List open job listings. Supports filtering by category, location, urgency and status.',
    params: [
      { name: 'category', type: 'string', optional: true, description: 'Filter by job category (e.g. plumbing)' },
      { name: 'location', type: 'string', optional: true, description: 'Filter by NZ region or city' },
      { name: 'urgency', type: 'string', optional: true, description: 'low | medium | high | emergency' },
      { name: 'page', type: 'number', optional: true, description: 'Page number (default: 1)' },
      { name: 'limit', type: 'number', optional: true, description: 'Results per page (default: 20, max: 100)' },
    ],
    example: `curl "${BASE_URL}/api/jobs?category=plumbing&location=Auckland&limit=10" \\
  -H "Authorization: Bearer qt_YOUR_API_KEY"`,
    scope: 'jobs:read',
  },
  {
    method: 'GET',
    path: '/api/workers',
    description: 'Search workers by category, location, availability and rating.',
    params: [
      { name: 'category', type: 'string', optional: true, description: 'Trade category' },
      { name: 'location', type: 'string', optional: true, description: 'NZ region or city' },
      { name: 'available', type: 'boolean', optional: true, description: 'Only show available workers' },
      { name: 'minRating', type: 'number', optional: true, description: 'Minimum star rating (1–5)' },
    ],
    example: `curl "${BASE_URL}/api/workers?category=electrical&location=Wellington" \\
  -H "Authorization: Bearer qt_YOUR_API_KEY"`,
    scope: 'workers:read',
  },
]

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-green-500/10 text-green-400 border-green-500/30',
  POST: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  DELETE: 'bg-red-500/10 text-red-400 border-red-500/30',
}

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-14">
        {/* Hero */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-300">
            <BookOpen className="h-4 w-4" />
            Partner API — Beta
          </div>
          <h1 className="mb-4 text-4xl font-bold text-white">QuickTrade API</h1>
          <p className="mx-auto max-w-xl text-lg text-slate-400">
            Integrate NZ trade job listings and worker profiles into your platform.
            Ideal for job boards, CRMs, and trade management software.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <Link
              href="/dashboard/settings/api-keys"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/20 hover:opacity-90 transition"
            >
              <Key className="h-4 w-4" />
              Get API Keys
            </Link>
            <Link
              href="mailto:api@workerconnect.co.nz"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white hover:bg-white/10 transition"
            >
              <ExternalLink className="h-4 w-4" />
              Contact Partner Team
            </Link>
          </div>
        </div>

        {/* Authentication */}
        <section className="mb-10 rounded-2xl border border-white/5 bg-white/5 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
            <Shield className="h-5 w-5 text-indigo-400" />
            Authentication
          </h2>
          <p className="mb-4 text-slate-400">
            All API requests require a bearer token in the <code className="text-indigo-300">Authorization</code> header.
            Generate keys from your{' '}
            <Link href="/dashboard/settings/api-keys" className="text-indigo-400 hover:underline">
              API settings
            </Link>.
          </p>
          <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm text-slate-300">
            <code>{`curl "${BASE_URL}/api/jobs" \\
  -H "Authorization: Bearer qt_YOUR_API_KEY"`}</code>
          </pre>
          <div className="mt-4 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-sm text-amber-300">
            Keep your API key secret. Do not expose it in client-side code or public repositories.
          </div>
        </section>

        {/* Rate limiting */}
        <section className="mb-10 rounded-2xl border border-white/5 bg-white/5 p-6">
          <h2 className="mb-3 text-xl font-bold text-white">Rate Limiting</h2>
          <p className="text-slate-400">
            Requests are rate-limited to <strong className="text-white">60 requests/minute</strong> per API key.
            Exceeding this returns a <code className="text-red-400">429 Too Many Requests</code> response.
          </p>
        </section>

        {/* Endpoints */}
        <section className="mb-10">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-white">
            <Code className="h-5 w-5 text-indigo-400" />
            Endpoints
          </h2>
          <div className="space-y-6">
            {ENDPOINTS.map((ep) => (
              <div key={ep.path} className="rounded-2xl border border-white/5 bg-white/5 p-6">
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${METHOD_COLORS[ep.method] ?? ''}`}>
                    {ep.method}
                  </span>
                  <code className="text-sm font-mono text-white">{ep.path}</code>
                  <span className="ml-auto rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-xs text-indigo-300">
                    Scope: {ep.scope}
                  </span>
                </div>
                <p className="mb-4 text-sm text-slate-400">{ep.description}</p>

                {ep.params.length > 0 && (
                  <div className="mb-4 overflow-x-auto rounded-xl border border-white/5">
                    <table className="w-full text-sm">
                      <thead className="border-b border-white/5 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-4 py-2.5 text-left">Parameter</th>
                          <th className="px-4 py-2.5 text-left">Type</th>
                          <th className="px-4 py-2.5 text-left">Required</th>
                          <th className="px-4 py-2.5 text-left">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {ep.params.map((p) => (
                          <tr key={p.name} className="text-slate-300">
                            <td className="px-4 py-2.5 font-mono text-xs text-indigo-300">{p.name}</td>
                            <td className="px-4 py-2.5 text-xs text-slate-400">{p.type}</td>
                            <td className="px-4 py-2.5 text-xs">
                              {p.optional ? (
                                <span className="text-slate-500">Optional</span>
                              ) : (
                                <span className="text-red-400">Required</span>
                              )}
                            </td>
                            <td className="px-4 py-2.5 text-xs text-slate-400">{p.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-300">
                  <code>{ep.example}</code>
                </pre>
              </div>
            ))}
          </div>
        </section>

        {/* Error codes */}
        <section className="rounded-2xl border border-white/5 bg-white/5 p-6">
          <h2 className="mb-4 text-xl font-bold text-white">Error Codes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/5 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2.5 text-left">Code</th>
                  <th className="px-4 py-2.5 text-left">Meaning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {[
                  ['200', 'OK — request succeeded'],
                  ['201', 'Created — resource created successfully'],
                  ['400', 'Bad Request — missing or invalid parameters'],
                  ['401', 'Unauthorised — missing or invalid API key'],
                  ['403', 'Forbidden — API key lacks required scope'],
                  ['404', 'Not Found — resource does not exist'],
                  ['429', 'Too Many Requests — rate limit exceeded'],
                  ['500', 'Server Error — contact support'],
                ].map(([code, meaning]) => (
                  <tr key={code}>
                    <td className="px-4 py-2.5 font-mono text-xs text-indigo-300">{code}</td>
                    <td className="px-4 py-2.5 text-xs">{meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

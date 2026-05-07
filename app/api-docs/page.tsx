import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Code, Terminal, Key, Layers, Users } from 'lucide-react'
import { SITE_URL } from '@/lib/seo/config'

export const metadata: Metadata = {
  title: 'API Documentation | QuickTrade',
  description: 'Partner API documentation for QuickTrade. Access open jobs and verified workers programmatically.',
  alternates: { canonical: `${SITE_URL}/api-docs` },
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-slate-950 border border-slate-700/50 rounded-xl p-4 overflow-x-auto text-sm font-mono text-slate-300 leading-relaxed">
      <code>{children}</code>
    </pre>
  )
}

function EndpointSection({
  method,
  path,
  description,
  params,
  curlExample,
  responseExample,
}: {
  method: string
  path: string
  description: string
  params: { name: string; type: string; description: string; required?: boolean }[]
  curlExample: string
  responseExample: string
}) {
  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-slate-700/50 flex items-center gap-3">
        <span className={`text-xs font-bold px-2.5 py-1 rounded ${
          method === 'GET' ? 'bg-green-900/40 text-green-300' : 'bg-blue-900/40 text-blue-300'
        }`}>
          {method}
        </span>
        <code className="text-slate-200 font-mono text-sm">{path}</code>
      </div>
      <div className="px-6 py-5 space-y-6">
        <p className="text-slate-400 text-sm">{description}</p>

        {params.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Parameters</h4>
            <div className="space-y-2">
              {params.map((p) => (
                <div key={p.name} className="flex items-start gap-3 text-sm">
                  <code className="text-indigo-300 font-mono shrink-0">{p.name}</code>
                  <span className="text-slate-500 text-xs mt-0.5 shrink-0">{p.type}</span>
                  {p.required && (
                    <span className="text-red-400 text-xs mt-0.5 shrink-0">required</span>
                  )}
                  <span className="text-slate-400">{p.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Terminal className="h-3.5 w-3.5" />
            Example Request
          </h4>
          <CodeBlock>{curlExample}</CodeBlock>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Code className="h-3.5 w-3.5" />
            Example Response
          </h4>
          <CodeBlock>{responseExample}</CodeBlock>
        </div>
      </div>
    </div>
  )
}

export default function ApiDocsPage() {
  return (
    <div className="flex flex-col min-h-screen luxury-bg">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section
          className="relative py-20 px-4"
          style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #111827 60%, #0a0f1e 100%)' }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-6">
              <Key className="h-4 w-4" />
              Partner API
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
              QuickTrade{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Open API
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mb-8">
              Integrate QuickTrade job listings and verified worker profiles into your platform.
              Contact us to obtain a partner API key.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span className="h-2 w-2 rounded-full bg-green-400" />
                REST API
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span className="h-2 w-2 rounded-full bg-green-400" />
                JSON responses
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span className="h-2 w-2 rounded-full bg-green-400" />
                API key authentication
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Authentication */}
          <div className="mb-10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Key className="h-5 w-5 text-indigo-400" />
              Authentication
            </h2>
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-6">
              <p className="text-slate-400 text-sm mb-4">
                All partner API endpoints require an <code className="text-indigo-300">x-api-key</code> header.
                Contact <a href="mailto:support@quicktrade.co.nz" className="text-indigo-400 hover:text-indigo-300">support@quicktrade.co.nz</a> to obtain a key.
              </p>
              <CodeBlock>{`# Include in every request:
x-api-key: your_api_key_here`}</CodeBlock>
            </div>
          </div>

          {/* Base URL */}
          <div className="mb-10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-400" />
              Base URL
            </h2>
            <CodeBlock>{`${SITE_URL}`}</CodeBlock>
          </div>

          {/* Endpoints */}
          <div className="mb-10">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Code className="h-5 w-5 text-indigo-400" />
              Endpoints
            </h2>

            <EndpointSection
              method="GET"
              path="/api/partner/jobs"
              description="Returns a paginated list of open job listings. Jobs are ordered by creation date, newest first."
              params={[
                { name: 'page', type: 'integer', description: 'Page number (default: 1)' },
                { name: 'pageSize', type: 'integer', description: 'Results per page, max 100 (default: 20)' },
              ]}
              curlExample={`curl -X GET "${SITE_URL}/api/partner/jobs?page=1&pageSize=10" \\
  -H "x-api-key: your_api_key_here"`}
              responseExample={`{
  "jobs": [
    {
      "id": "abc123",
      "title": "Bathroom Renovation — Plumbing",
      "description": "Need a licensed plumber for a full bathroom remodel...",
      "category": "plumbing",
      "location": "Auckland",
      "budget": 2500,
      "budgetType": "fixed",
      "urgency": "medium",
      "createdAt": "2025-01-15T08:30:00.000Z",
      "country": "NZ"
    }
  ],
  "total": 42,
  "page": 1,
  "pageSize": 10
}`}
            />

            <EndpointSection
              method="GET"
              path="/api/partner/workers"
              description="Returns a paginated list of verified worker profiles. Includes availability, skills, and ratings."
              params={[
                { name: 'page', type: 'integer', description: 'Page number (default: 1)' },
                { name: 'pageSize', type: 'integer', description: 'Results per page, max 100 (default: 20)' },
              ]}
              curlExample={`curl -X GET "${SITE_URL}/api/partner/workers?page=1&pageSize=10" \\
  -H "x-api-key: your_api_key_here"`}
              responseExample={`{
  "workers": [
    {
      "uid": "worker_uid_here",
      "displayName": "James Wilson",
      "location": "Wellington",
      "skills": ["Plumbing", "Gas Fitting", "Drainage"],
      "hourlyRate": 95,
      "rating": 4.9,
      "reviewCount": 38,
      "completedJobs": 45,
      "availability": "available",
      "country": "NZ"
    }
  ],
  "total": 87,
  "page": 1,
  "pageSize": 10
}`}
            />
          </div>

          {/* Error codes */}
          <div className="mb-10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-400" />
              Error Codes
            </h2>
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 overflow-hidden">
              <div className="divide-y divide-slate-800">
                {[
                  { code: 200, label: 'OK', description: 'Request succeeded.' },
                  { code: 400, label: 'Bad Request', description: 'Invalid parameters.' },
                  { code: 401, label: 'Unauthorised', description: 'Missing or invalid API key.' },
                  { code: 500, label: 'Internal Server Error', description: 'Something went wrong on our end.' },
                ].map(({ code, label, description }) => (
                  <div key={code} className="flex items-center gap-4 px-6 py-4 text-sm">
                    <code className={`font-mono font-bold ${code === 200 ? 'text-green-400' : 'text-red-400'}`}>
                      {code}
                    </code>
                    <span className="text-slate-300 font-medium">{label}</span>
                    <span className="text-slate-500">{description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rate limits */}
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-900/10 p-6">
            <h3 className="text-sm font-semibold text-indigo-300 mb-2">Rate Limits & Fair Use</h3>
            <p className="text-sm text-slate-400">
              Partner API keys are subject to fair use policies. Contact{' '}
              <a href="mailto:support@quicktrade.co.nz" className="text-indigo-400 hover:text-indigo-300">
                support@quicktrade.co.nz
              </a>{' '}
              if you need higher limits or a dedicated integration agreement.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

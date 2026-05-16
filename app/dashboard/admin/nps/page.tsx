'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { TrendingUp, ThumbsUp, ThumbsDown, Minus, MessageSquare, Smile } from 'lucide-react'

interface NPSResponse {
  id: string
  userId: string
  jobId: string
  role: string
  score: number
  comment?: string
  createdAt?: string
  submittedAt?: string
}

interface NPSSummary {
  avgScore: number
  promoters: number
  passives: number
  detractors: number
  npsScore: number
  total: number
  recentResponses: NPSResponse[]
}

function fmtDate(iso?: string) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-NZ', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  } catch {
    return iso
  }
}

function StatCard({
  label, value, sub, icon: Icon, iconColor, iconBg,
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  iconColor: string
  iconBg: string
}) {
  return (
    <div className="bg-slate-800 rounded-xl p-4 flex items-start gap-3">
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400 truncate">{label}</p>
        <p className="text-xl font-bold text-white">{value}</p>
        {sub && <p className="text-xs text-slate-500 truncate">{sub}</p>}
      </div>
    </div>
  )
}

function scoreColor(score: number): string {
  if (score >= 9) return 'bg-green-500/15 text-green-400 border-green-500/30'
  if (score >= 7) return 'bg-amber-500/15 text-amber-400 border-amber-500/30'
  return 'bg-red-500/15 text-red-400 border-red-500/30'
}

function scoreBucket(score: number): 'Promoter' | 'Passive' | 'Detractor' {
  if (score >= 9) return 'Promoter'
  if (score >= 7) return 'Passive'
  return 'Detractor'
}

export default function NPSInsightsPage() {
  const { user } = useAuth()
  const [data, setData] = useState<NPSSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.uid) return
    setLoading(true)
    setError(null)
    fetch('/api/nps', { headers: { 'x-user-id': user.uid } })
      .then(async (r) => {
        if (!r.ok) {
          const txt = await r.text().catch(() => '')
          throw new Error(txt || `Request failed (${r.status})`)
        }
        return r.json() as Promise<NPSSummary>
      })
      .then((d) => setData(d))
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'Failed to load NPS data')
      })
      .finally(() => setLoading(false))
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-2">NPS Insights</h1>
        <div className="bg-red-900/30 border border-red-800 text-red-300 rounded-lg p-4 text-sm">
          {error ?? 'Failed to load NPS data.'}
        </div>
      </div>
    )
  }

  const { avgScore, promoters, passives, detractors, npsScore, total, recentResponses } = data
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">NPS Insights</h1>
        <p className="text-sm text-slate-400 mt-1">
          Net Promoter Score across all completed jobs (last 500 responses)
        </p>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          label="NPS Score"
          value={npsScore}
          sub={npsScore >= 50 ? 'Excellent' : npsScore >= 0 ? 'Good' : 'Needs attention'}
          icon={TrendingUp}
          iconColor="text-indigo-400"
          iconBg="bg-indigo-900/40"
        />
        <StatCard
          label="Avg Score"
          value={avgScore.toFixed(1)}
          sub="0–10 scale"
          icon={Smile}
          iconColor="text-amber-400"
          iconBg="bg-amber-900/40"
        />
        <StatCard
          label="Promoters"
          value={`${promoters} (${pct(promoters)}%)`}
          sub="Score 9–10"
          icon={ThumbsUp}
          iconColor="text-green-400"
          iconBg="bg-green-900/40"
        />
        <StatCard
          label="Passives"
          value={`${passives} (${pct(passives)}%)`}
          sub="Score 7–8"
          icon={Minus}
          iconColor="text-slate-300"
          iconBg="bg-slate-700/60"
        />
        <StatCard
          label="Detractors"
          value={`${detractors} (${pct(detractors)}%)`}
          sub="Score 0–6"
          icon={ThumbsDown}
          iconColor="text-red-400"
          iconBg="bg-red-900/40"
        />
      </div>

      {/* Distribution bar */}
      <div className="bg-slate-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-300 mb-4">
          Distribution ({total} response{total === 1 ? '' : 's'})
        </h2>
        {total === 0 ? (
          <p className="text-sm text-slate-500">No NPS responses recorded yet.</p>
        ) : (
          <div className="flex h-3 w-full rounded-full overflow-hidden bg-slate-900">
            <div
              className="bg-green-500"
              style={{ width: `${pct(promoters)}%` }}
              title={`Promoters: ${promoters}`}
            />
            <div
              className="bg-slate-500"
              style={{ width: `${pct(passives)}%` }}
              title={`Passives: ${passives}`}
            />
            <div
              className="bg-red-500"
              style={{ width: `${pct(detractors)}%` }}
              title={`Detractors: ${detractors}`}
            />
          </div>
        )}
      </div>

      {/* Recent responses */}
      <div className="bg-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-300">Recent Responses</h2>
        </div>
        {recentResponses.length === 0 ? (
          <p className="text-sm text-slate-500">No responses to show.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-slate-500 border-b border-slate-700">
                  <th className="py-2 pr-3 font-medium">Submitted</th>
                  <th className="py-2 pr-3 font-medium">Role</th>
                  <th className="py-2 pr-3 font-medium">Score</th>
                  <th className="py-2 pr-3 font-medium">Bucket</th>
                  <th className="py-2 pr-3 font-medium">Job</th>
                  <th className="py-2 font-medium">Comment</th>
                </tr>
              </thead>
              <tbody>
                {recentResponses.map((r) => (
                  <tr key={r.id} className="border-b border-slate-800 last:border-0 align-top">
                    <td className="py-3 pr-3 text-slate-300 whitespace-nowrap">
                      {fmtDate(r.submittedAt ?? r.createdAt)}
                    </td>
                    <td className="py-3 pr-3 text-slate-300 capitalize">{r.role}</td>
                    <td className="py-3 pr-3">
                      <span
                        className={`inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full border text-xs font-semibold ${scoreColor(r.score)}`}
                      >
                        {r.score}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-slate-400 text-xs">{scoreBucket(r.score)}</td>
                    <td className="py-3 pr-3 text-slate-400 text-xs font-mono truncate max-w-[10rem]">
                      {r.jobId}
                    </td>
                    <td className="py-3 text-slate-300 text-xs max-w-md">
                      {r.comment ? r.comment : <span className="text-slate-600">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

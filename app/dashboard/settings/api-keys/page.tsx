'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import toast from 'react-hot-toast'
import {
  Key, Plus, Trash2, Copy, Eye, EyeOff, ExternalLink, ShieldCheck, Clock,
} from 'lucide-react'

interface ApiKey {
  id: string
  name: string
  prefix: string
  createdAt: string
  lastUsedAt: string | null
  scopes: string[]
}

const SCOPE_LABELS: Record<string, string> = {
  'jobs:read': 'Read Jobs',
  'workers:read': 'Read Workers',
  'quotes:read': 'Read Quotes',
}

function fmtDate(iso?: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ApiKeysPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['jobs:read', 'workers:read'])
  const [creating, setCreating] = useState(false)
  const [rawKey, setRawKey] = useState<string | null>(null)
  const [keyVisible, setKeyVisible] = useState(false)

  const loadKeys = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await fetch('/api/api-keys', { headers: { 'x-user-id': user.uid } })
      const data = await res.json()
      setKeys(data.keys ?? [])
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [user])

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return }
    loadKeys()
  }, [user, router, loadKeys])

  async function createKey() {
    if (!user || !newName.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.uid },
        body: JSON.stringify({ name: newName.trim(), scopes: selectedScopes }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Failed to create key'); return }
      setRawKey(data.key.rawKey)
      setShowCreate(false)
      setNewName('')
      await loadKeys()
    } catch {
      toast.error('Something went wrong')
    } finally {
      setCreating(false)
    }
  }

  async function revokeKey(id: string) {
    if (!user) return
    if (!confirm('Revoke this API key? Any integrations using it will stop working.')) return
    try {
      const res = await fetch(`/api/api-keys?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user.uid },
      })
      if (!res.ok) { toast.error('Failed to revoke key'); return }
      toast.success('API key revoked')
      setKeys((k) => k.filter((key) => key.id !== id))
    } catch {
      toast.error('Something went wrong')
    }
  }

  function copyKey() {
    if (!rawKey) return
    navigator.clipboard.writeText(rawKey).then(() => toast.success('Copied to clipboard!'))
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300">
            <Key className="h-4 w-4" />
            Partner API
          </div>
          <h1 className="mb-2 text-3xl font-bold text-white">API Keys</h1>
          <p className="text-slate-400">
            Integrate QuickTrade data into your own systems. Keys are scoped to read-only endpoints.{' '}
            <a href="/api-docs" className="text-indigo-400 hover:underline inline-flex items-center gap-1">
              View API docs <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </div>

        {/* Newly created key banner */}
        {rawKey && (
          <div className="mb-6 rounded-2xl border border-green-500/30 bg-green-500/10 p-5">
            <div className="mb-2 flex items-center gap-2 text-green-300 font-semibold">
              <ShieldCheck className="h-4 w-4" />
              Key created — copy it now. It won&apos;t be shown again.
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-xl bg-black/30 px-3 py-2 text-sm font-mono text-green-200 break-all">
                {keyVisible ? rawKey : rawKey.replace(/./g, '•')}
              </code>
              <button onClick={() => setKeyVisible((v) => !v)} className="rounded-lg p-2 hover:bg-white/5">
                {keyVisible ? <EyeOff className="h-4 w-4 text-slate-400" /> : <Eye className="h-4 w-4 text-slate-400" />}
              </button>
              <button onClick={copyKey} className="rounded-lg p-2 hover:bg-white/5">
                <Copy className="h-4 w-4 text-slate-400" />
              </button>
            </div>
            <button
              onClick={() => setRawKey(null)}
              className="mt-3 text-xs text-slate-400 hover:text-slate-300"
            >
              I&apos;ve saved it — dismiss
            </button>
          </div>
        )}

        {/* Create key panel */}
        {showCreate && (
          <div className="mb-6 rounded-2xl border border-white/5 bg-white/5 p-5 space-y-4">
            <h2 className="font-semibold text-white">New API Key</h2>
            <div>
              <label className="mb-1 block text-sm text-slate-400">Key Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. My CRM Integration"
                maxLength={60}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-400">Scopes</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(SCOPE_LABELS).map(([scope, label]) => (
                  <label key={scope} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedScopes.includes(scope)}
                      onChange={(e) =>
                        setSelectedScopes((s) =>
                          e.target.checked ? [...s, scope] : s.filter((x) => x !== scope),
                        )
                      }
                      className="rounded accent-indigo-500"
                    />
                    <span className="text-sm text-slate-300">{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={createKey}
                disabled={creating || !newName.trim()}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:opacity-90 disabled:opacity-50"
              >
                {creating ? 'Creating…' : 'Create Key'}
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Keys list */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-white">Active Keys ({keys.length}/5)</h2>
          {!showCreate && (
            <button
              onClick={() => setShowCreate(true)}
              disabled={keys.length >= 5}
              className="flex items-center gap-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 px-4 py-2 text-sm text-indigo-300 hover:bg-indigo-600/30 transition disabled:opacity-50"
            >
              <Plus className="h-4 w-4" /> New Key
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : keys.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-white/5 p-10 text-center text-slate-400">
            <Key className="mx-auto mb-3 h-8 w-8 opacity-40" />
            <p>No API keys yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {keys.map((key) => (
              <div key={key.id} className="rounded-2xl border border-white/5 bg-white/5 p-5">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{key.name}</p>
                    <code className="text-xs text-slate-500 font-mono">{key.prefix}••••••••••••••••</code>
                  </div>
                  <button
                    onClick={() => revokeKey(key.id)}
                    className="rounded-lg p-1.5 text-red-400 hover:bg-red-500/10 transition"
                    title="Revoke key"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {key.scopes.map((s) => (
                    <span key={s} className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs text-indigo-300 border border-indigo-500/20">
                      {SCOPE_LABELS[s] ?? s}
                    </span>
                  ))}
                </div>
                <div className="flex gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Created {fmtDate(key.createdAt)}
                  </span>
                  {key.lastUsedAt && (
                    <span>Last used {fmtDate(key.lastUsedAt)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { Key, Plus, Eye, EyeOff, ToggleLeft, ToggleRight, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface ApiKey {
  key: string
  name: string
  ownerId: string
  ownerEmail: string
  createdAt: string
  active: boolean
}

export default function AdminApiKeysPage() {
  const { user } = useAuth()
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [generating, setGenerating] = useState(false)
  const [revealedKey, setRevealedKey] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const fetchKeys = async () => {
    if (!user) return
    try {
      const res = await fetch('/api/admin/api-keys', { headers: { 'x-user-id': user.uid } })
      const data = await res.json()
      setKeys(data.keys ?? [])
    } catch {
      toast.error('Failed to load API keys')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKeys()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newName.trim()) return
    setGenerating(true)
    try {
      const res = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.uid },
        body: JSON.stringify({ name: newName.trim(), ownerEmail: newEmail.trim(), ownerId: user.uid }),
      })
      if (!res.ok) throw new Error('Failed to generate key')
      const data = await res.json()
      toast.success(`API key generated: ${data.key}`)
      setNewName('')
      setNewEmail('')
      await fetchKeys()
    } catch {
      toast.error('Failed to generate API key')
    } finally {
      setGenerating(false)
    }
  }

  const handleToggle = async (key: string, currentActive: boolean) => {
    if (!user) return
    try {
      await fetch('/api/admin/api-keys', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.uid },
        body: JSON.stringify({ key, active: !currentActive }),
      })
      setKeys((prev) => prev.map((k) => k.key === key ? { ...k, active: !currentActive } : k))
      toast.success(`Key ${!currentActive ? 'enabled' : 'disabled'}`)
    } catch {
      toast.error('Failed to update key')
    }
  }

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const maskKey = (key: string) => `${key.slice(0, 8)}${'•'.repeat(16)}${key.slice(-8)}`

  return (
    <div className="p-6 sm:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Key className="h-7 w-7 text-indigo-400" />
            API Keys
          </h1>
          <p className="text-slate-400 mt-1">Manage partner API keys for the Open API endpoints.</p>
        </div>

        {/* Generate new key form */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-indigo-400" />
            Generate New API Key
          </h2>
          <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Key name (e.g. Acme Corp)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              className="flex-1 rounded-lg bg-slate-800 border border-slate-600 text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-500"
            />
            <input
              type="email"
              placeholder="Owner email (optional)"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="flex-1 rounded-lg bg-slate-800 border border-slate-600 text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={generating || !newName.trim()}
              className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              {generating ? 'Generating…' : 'Generate Key'}
            </button>
          </form>
        </div>

        {/* Keys table */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-base font-semibold text-white">Active API Keys ({keys.length})</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500 text-sm">Loading…</div>
          ) : keys.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No API keys yet. Generate one above.</div>
          ) : (
            <div className="divide-y divide-slate-800">
              {keys.map((k) => (
                <div key={k.key} className="px-6 py-4 flex items-center gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-200 text-sm">{k.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{k.ownerEmail || 'No email'} · {new Date(k.createdAt).toLocaleDateString('en-NZ')}</p>
                  </div>

                  <div className="flex items-center gap-1 font-mono text-xs text-slate-400 bg-slate-800 px-3 py-1.5 rounded-lg">
                    {revealedKey === k.key ? k.key : maskKey(k.key)}
                    <button
                      onClick={() => setRevealedKey(revealedKey === k.key ? null : k.key)}
                      className="ml-2 text-slate-500 hover:text-slate-300"
                      aria-label={revealedKey === k.key ? 'Hide key' : 'Reveal key'}
                    >
                      {revealedKey === k.key ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={() => handleCopy(k.key)}
                      className="ml-1 text-slate-500 hover:text-slate-300"
                      aria-label="Copy key"
                    >
                      {copiedKey === k.key ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    k.active ? 'bg-green-900/30 text-green-400' : 'bg-slate-700 text-slate-400'
                  }`}>
                    {k.active ? 'Active' : 'Disabled'}
                  </span>

                  <button
                    onClick={() => handleToggle(k.key, k.active)}
                    className="text-slate-400 hover:text-white transition-colors"
                    aria-label={k.active ? 'Disable key' : 'Enable key'}
                  >
                    {k.active ? (
                      <ToggleRight className="h-6 w-6 text-green-400" />
                    ) : (
                      <ToggleLeft className="h-6 w-6" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

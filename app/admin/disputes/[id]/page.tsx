'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/Card'
import DisputeStatusBadge from '@/components/disputes/DisputeStatusBadge'
import DisputeTimeline from '@/components/disputes/DisputeTimeline'
import EvidenceUpload from '@/components/disputes/EvidenceUpload'
import { useAuth } from '@/components/providers/AuthProvider'
import {
  subscribeToDispute,
  subscribeToDisputeMessages,
  getDisputeEvidence,
  getDisputeResolution,
  sendDisputeMessage,
  uploadEvidence,
  submitResolution,
  updateDispute,
  DISPUTE_REASON_LABELS,
  DISPUTE_DECISION_LABELS,
} from '@/lib/services/disputeService'
import type { Dispute, DisputeMessage, DisputeEvidence, DisputeResolution, DisputeDecision, EvidenceType } from '@/types'
import { ArrowLeft, Send, Paperclip, ChevronDown, Shield, TrendingUp } from 'lucide-react'

const DECISIONS: DisputeDecision[] = ['approved', 'denied', 'partial_refund', 'escalated']

export default function AdminDisputeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()

  const [dispute, setDispute] = useState<Dispute | null>(null)
  const [messages, setMessages] = useState<DisputeMessage[]>([])
  const [evidence, setEvidence] = useState<DisputeEvidence[]>([])
  const [resolution, setResolution] = useState<DisputeResolution | null>(null)
  const [loading, setLoading] = useState(true)

  // Message
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)

  // Evidence
  const [uploading, setUploading] = useState(false)
  const [showEvidenceUpload, setShowEvidenceUpload] = useState(false)

  // Resolution form
  const [decision, setDecision] = useState<DisputeDecision>('approved')
  const [refundAmount, setRefundAmount] = useState('')
  const [reasoning, setReasoning] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resError, setResError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    const unsub1 = subscribeToDispute(id, (d) => {
      setDispute(d)
      setLoading(false)
    })
    const unsub2 = subscribeToDisputeMessages(id, setMessages)
    getDisputeEvidence(id).then(setEvidence)
    getDisputeResolution(id).then(setResolution)
    return () => { unsub1(); unsub2() }
  }, [id])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !messageText.trim()) return
    setSending(true)
    try {
      await sendDisputeMessage({
        disputeId: id,
        senderId: user.uid,
        senderName: user.displayName ?? 'Mediator',
        senderRole: 'mediator',
        message: messageText.trim(),
        isInternal: false,
      })
      setMessageText('')
    } finally {
      setSending(false)
    }
  }

  async function handleEvidenceUpload(file: File, type: EvidenceType, desc: string) {
    if (!user) return
    setUploading(true)
    try {
      const ev = await uploadEvidence(id, file, type, desc, user.uid, user.displayName ?? 'Mediator')
      setEvidence((prev) => [...prev, ev])
      setShowEvidenceUpload(false)
    } finally {
      setUploading(false)
    }
  }

  async function handleAssign() {
    if (!user || !dispute) return
    await updateDispute(id, {
      status: 'under_review',
      mediatorId: user.uid,
      mediatorName: user.displayName ?? 'Mediator',
    })
  }

  async function handleResolution(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    if (!reasoning.trim()) { setResError('Please provide reasoning.'); return }
    const amount = parseFloat(refundAmount) || 0
    if ((decision === 'partial_refund') && amount <= 0) {
      setResError('Please enter a valid refund amount for partial refund.')
      return
    }
    setResError(null)
    setSubmitting(true)
    try {
      await submitResolution(
        id,
        decision,
        decision === 'approved' ? (dispute?.refundAmount ?? 0) : amount,
        user.uid,
        user.displayName ?? 'Mediator',
        reasoning.trim()
      )
      router.push('/admin/disputes')
    } catch {
      setResError('Failed to submit resolution. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center text-gray-400">Loading…</main>
        <Footer />
      </div>
    )
  }

  if (!dispute) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center text-gray-400">Dispute not found.</main>
        <Footer />
      </div>
    )
  }

  const isClosed = dispute.status === 'resolved' || dispute.status === 'closed'
  const isAssigned = !!dispute.mediatorId

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          <Link
            href="/admin/disputes"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Queue
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left: timeline & messaging */}
            <div className="lg:col-span-2 space-y-6">

              {/* Header */}
              <Card padding="md">
                <CardContent>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Dispute #{id.slice(0, 8)}</p>
                      <h1 className="text-xl font-bold text-gray-900 dark:text-white">{dispute.jobTitle}</h1>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {DISPUTE_REASON_LABELS[dispute.reason] ?? dispute.reason}
                      </p>
                    </div>
                    <DisputeStatusBadge status={dispute.status} />
                  </div>
                  <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">{dispute.description}</p>
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>Worker: <strong className="text-gray-700 dark:text-gray-300">{dispute.workerName}</strong></span>
                    <span>Client: <strong className="text-gray-700 dark:text-gray-300">{dispute.clientName}</strong></span>
                    <span>Filed: <strong className="text-gray-700 dark:text-gray-300">{new Date(dispute.createdAt).toLocaleDateString()}</strong></span>
                    <span>Due by: <strong className="text-gray-700 dark:text-gray-300">{new Date(dispute.dueDate).toLocaleDateString()}</strong></span>
                  </div>

                  {!isAssigned && !isClosed && (
                    <button
                      onClick={handleAssign}
                      className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      <Shield className="h-3 w-3" />
                      Assign to Me
                    </button>
                  )}
                  {isAssigned && (
                    <p className="mt-3 text-xs text-purple-600 dark:text-purple-400">
                      Assigned to: {dispute.mediatorName ?? dispute.mediatorId}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card padding="md">
                <CardContent>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Timeline</h2>
                  <DisputeTimeline
                    messages={messages}
                    evidence={evidence}
                    resolution={resolution}
                    currentUserId={user?.uid}
                  />
                </CardContent>
              </Card>

              {/* Mediator message */}
              {!isClosed && (
                <Card padding="md">
                  <CardContent>
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                      Mediator Message
                    </h2>
                    <form onSubmit={handleSend} className="flex gap-2">
                      <textarea
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Send a message to all parties…"
                        rows={2}
                        className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      />
                      <button
                        type="submit"
                        disabled={sending || !messageText.trim()}
                        className="self-end flex items-center gap-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        <Send className="h-4 w-4" />
                        {sending ? 'Sending…' : 'Send'}
                      </button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right: evidence + resolution */}
            <div className="space-y-6">

              {/* Evidence upload */}
              {!isClosed && (
                <Card padding="md">
                  <CardContent>
                    <button
                      onClick={() => setShowEvidenceUpload((v) => !v)}
                      className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 w-full"
                    >
                      <Paperclip className="h-4 w-4" />
                      Add Evidence
                      <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${showEvidenceUpload ? 'rotate-180' : ''}`} />
                    </button>
                    {showEvidenceUpload && (
                      <div className="mt-4">
                        <EvidenceUpload onUpload={handleEvidenceUpload} uploading={uploading} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Resolution panel */}
              {!isClosed && !resolution ? (
                <Card padding="md">
                  <CardContent>
                    <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white mb-4">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      Submit Decision
                    </h2>
                    <form onSubmit={handleResolution} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Decision *
                        </label>
                        <select
                          value={decision}
                          onChange={(e) => setDecision(e.target.value as DisputeDecision)}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          {DECISIONS.map((d) => (
                            <option key={d} value={d}>{DISPUTE_DECISION_LABELS[d]}</option>
                          ))}
                        </select>
                      </div>

                      {decision === 'partial_refund' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Refund Amount ($) *
                          </label>
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={refundAmount}
                            onChange={(e) => setRefundAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Reasoning / Case Notes *
                        </label>
                        <textarea
                          value={reasoning}
                          onChange={(e) => setReasoning(e.target.value)}
                          required
                          rows={4}
                          placeholder="Explain the basis for your decision…"
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                        />
                      </div>

                      {resError && (
                        <p className="text-sm text-red-600 dark:text-red-400">{resError}</p>
                      )}

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        <Shield className="h-4 w-4" />
                        {submitting ? 'Submitting…' : 'Submit Decision'}
                      </button>
                    </form>
                  </CardContent>
                </Card>
              ) : resolution ? (
                <Card padding="md">
                  <CardContent>
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Resolution</h2>
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                      {DISPUTE_DECISION_LABELS[resolution.decision]}
                    </p>
                    {resolution.refundAmount > 0 && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        Refund: <strong>${resolution.refundAmount.toFixed(2)}</strong>
                      </p>
                    )}
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{resolution.reasoning}</p>
                    <p className="mt-2 text-xs text-gray-400">
                      By {resolution.mediatorName} · {new Date(resolution.timestamp).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

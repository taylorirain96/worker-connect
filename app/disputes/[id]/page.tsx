'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
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
  sendDisputeMessage,
  getDisputeEvidence,
  uploadEvidence,
  getDisputeResolution,
  DISPUTE_REASON_LABELS,
} from '@/lib/services/disputeService'
import type { Dispute, DisputeMessage, DisputeEvidence, DisputeResolution, EvidenceType } from '@/types'
import { ArrowLeft, Send, Paperclip, ChevronDown } from 'lucide-react'

export default function DisputeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()

  const [dispute, setDispute] = useState<Dispute | null>(null)
  const [messages, setMessages] = useState<DisputeMessage[]>([])
  const [evidence, setEvidence] = useState<DisputeEvidence[]>([])
  const [resolution, setResolution] = useState<DisputeResolution | null>(null)
  const [loading, setLoading] = useState(true)
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showEvidenceUpload, setShowEvidenceUpload] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !dispute || !messageText.trim()) return
    setSending(true)
    try {
      await sendDisputeMessage({
        disputeId: id,
        senderId: user.uid,
        senderName: user.displayName ?? 'User',
        senderRole: 'client',
        message: messageText.trim(),
        isInternal: false,
      })
      setMessageText('')
    } finally {
      setSending(false)
    }
  }

  async function handleEvidenceUpload(file: File, type: EvidenceType, description: string) {
    if (!user) return
    setUploading(true)
    try {
      const ev = await uploadEvidence(id, file, type, description, user.uid, user.displayName ?? 'User')
      setEvidence((prev) => [...prev, ev])
      setShowEvidenceUpload(false)
    } finally {
      setUploading(false)
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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          <Link
            href="/disputes"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Disputes
          </Link>

          {/* Header */}
          <Card padding="md">
            <CardContent>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Dispute #{id.slice(0, 8)}</p>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">{dispute.jobTitle}</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {DISPUTE_REASON_LABELS[dispute.reason as keyof typeof DISPUTE_REASON_LABELS] ?? dispute.reason}
                  </p>
                </div>
                <DisputeStatusBadge status={dispute.status} />
              </div>
              <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">{dispute.description}</p>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span>Worker: <strong className="text-gray-700 dark:text-gray-300">{dispute.workerName}</strong></span>
                <span>Filed: <strong className="text-gray-700 dark:text-gray-300">{new Date(dispute.createdAt).toLocaleDateString()}</strong></span>
                <span>Due by: <strong className="text-gray-700 dark:text-gray-300">{dispute.dueDate ? new Date(dispute.dueDate).toLocaleDateString() : 'N/A'}</strong></span>
                {dispute.mediatorName && (
                  <span>Mediator: <strong className="text-gray-700 dark:text-gray-300">{dispute.mediatorName}</strong></span>
                )}
              </div>
              {dispute.refundAmount !== undefined && dispute.refundAmount > 0 && (
                <div className="mt-3 p-2 rounded bg-green-50 dark:bg-green-900/20 text-sm text-green-700 dark:text-green-400">
                  Refund: <strong>${dispute.refundAmount.toFixed(2)}</strong>
                  {dispute.refundStatus && (
                    <span className="ml-2 capitalize opacity-80">({dispute.refundStatus})</span>
                  )}
                </div>
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
              <div ref={bottomRef} />
            </CardContent>
          </Card>

          {/* Evidence upload */}
          {!isClosed && (
            <Card padding="md">
              <CardContent>
                <button
                  onClick={() => setShowEvidenceUpload((v) => !v)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  <Paperclip className="h-4 w-4" />
                  Upload Evidence
                  <ChevronDown className={`h-4 w-4 transition-transform ${showEvidenceUpload ? 'rotate-180' : ''}`} />
                </button>
                {showEvidenceUpload && (
                  <div className="mt-4">
                    <EvidenceUpload onUpload={handleEvidenceUpload} uploading={uploading} />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Message box */}
          {!isClosed && (
            <Card padding="md">
              <CardContent>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Send a Message</h2>
                <form onSubmit={handleSend} className="flex gap-2">
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Write a message…"
                    rows={2}
                    className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                  <button
                    type="submit"
                    disabled={sending || !messageText.trim()}
                    className="self-end flex items-center gap-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Send className="h-4 w-4" />
                    {sending ? 'Sending…' : 'Send'}
                  </button>
                </form>
              </CardContent>
            </Card>
          )}

          {isClosed && (
            <div className="text-center py-4 text-sm text-gray-400 dark:text-gray-600">
              This dispute has been {dispute.status}. No further messages can be sent.
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

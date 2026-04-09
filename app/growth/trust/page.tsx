// @ts-nocheck
'use client'

import { useState } from 'react'
import { AlertTriangle, Upload, FileText, CheckCircle, Clock } from 'lucide-react'
import type { DisputeAppeal } from '@/types/dispute'

// Mock data for demonstration
const MOCK_APPEALS: DisputeAppeal[] = [
  {
    id: 'appeal-1',
    userId: 'user-123',
    ratingId: 'rating-456',
    originalRating: 2,
    reason: 'Client provided inaccurate job description; completion time was misrepresented.',
    evidenceUrls: ['https://example.com/evidence1.jpg'],
    status: 'reviewing',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export default function TrustMediationPage() {
  const [appeals, setAppeals] = useState<DisputeAppeal[]>(MOCK_APPEALS)
  const [showNewAppealForm, setShowNewAppealForm] = useState(false)
  const [reason, setReason] = useState('')

  const handleSubmitAppeal = () => {
    const newAppeal: DisputeAppeal = {
      id: `appeal-${Date.now()}`,
      userId: 'user-123',
      ratingId: `rating-${Date.now()}`,
      originalRating: 2,
      reason,
      evidenceUrls: [],
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    setAppeals([newAppeal, ...appeals])
    setReason('')
    setShowNewAppealForm(false)
  }

  const STATUS_CONFIG = {
    pending: { label: 'Pending Review', color: 'text-yellow-400', bg: 'bg-yellow-900/20', icon: Clock },
    reviewing: { label: 'Under Review', color: 'text-blue-400', bg: 'bg-blue-900/20', icon: FileText },
    resolved: { label: 'Resolved', color: 'text-emerald-400', bg: 'bg-emerald-900/20', icon: CheckCircle },
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Trust & Mediation</h1>
        <p className="text-gray-400">Manage rating appeals and dispute resolution</p>
      </div>

      {/* Active Appeals Card with Moody Glow */}
      <div className="sweep-border breathing-glow bg-[#0f172a] rounded-lg p-6 mb-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-[#b822e4]" />
            <h2 className="text-xl font-semibold text-white">Active Appeals</h2>
          </div>
          <button
            onClick={() => setShowNewAppealForm(!showNewAppealForm)}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#b822e4] to-[#e97be4] text-white font-semibold hover:opacity-90 transition"
          >
            New Appeal
          </button>
        </div>

        {appeals.length === 0 && (
          <p className="text-gray-400 text-center py-8">No active appeals</p>
        )}

        {appeals.map((appeal) => {
          const config = STATUS_CONFIG[appeal.status]
          const Icon = config.icon
          return (
            <div key={appeal.id} className="bg-[#1a2332] rounded-lg p-5 mb-3 border border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-mono text-gray-500">#{appeal.id.slice(-6)}</span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.color}`}> 
                      <Icon className="h-3.5 w-3.5" />
                      {config.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    Original Rating: <span className="text-red-400 font-semibold">{appeal.originalRating}★</span>
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(appeal.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-300 text-sm mb-3">{appeal.reason}</p>
              {appeal.evidenceUrls.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#08d9d6]/10 text-[#08d9d6] text-xs font-semibold">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Evidence Uploaded
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* New Appeal Form */}
      {showNewAppealForm && (
        <div className="bg-[#0f172a] rounded-lg p-6 border border-gray-700 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Submit New Appeal</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">Reason for Appeal</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-[#1a2332] border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#b822e4] focus:border-transparent"
              rows={4}
              placeholder="Describe why you believe this rating is unfair..."
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">Upload Evidence (Optional)</label>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 text-gray-400 hover:border-[#08d9d6] hover:text-[#08d9d6] transition">
              <Upload className="h-4 w-4" />
              Choose Files
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSubmitAppeal}
              disabled={!reason.trim()}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#b822e4] to-[#e97be4] text-white font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Submit Appeal
            </button>
            <button
              onClick={() => setShowNewAppealForm(false)}
              className="px-5 py-2 rounded-lg border border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Info Panel */}
      <div className="bg-[#0f172a] rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">How Appeals Work</h3>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-[#08d9d6] mt-0.5">•</span>
            <span>Appeals are reviewed within 3-5 business days</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#08d9d6] mt-0.5">•</span>
            <span>Providing evidence (photos, messages) increases resolution speed</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#08d9d6] mt-0.5">•</span>
            <span>Our mediators review all cases impartially</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#08d9d6] mt-0.5">•</span>
            <span>Ratings may be adjusted, removed, or upheld based on evidence</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
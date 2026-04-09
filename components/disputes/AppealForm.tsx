'use client'
import React, { useState } from 'react'
import { X, Send, Paperclip, ShieldAlert } from 'lucide-react'

export default function AppealForm({ ratingId, onClose }: { ratingId: string, onClose: () => void }) {
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulated API call
    setTimeout(() => {
      setIsSubmitting(false)
      onClose()
    }, 1500)
  }

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-end">
      <div className="w-full max-w-md bg-[#0f172a] h-full border-l border-slate-800 p-8 shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-[#e97be4]" /> Open Appeal
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Case Reason</label>
            <textarea 
              className="w-full mt-2 bg-slate-900 border border-slate-800 rounded-xl p-4 text-white focus:ring-2 focus:ring-[#b822e4] outline-none transition-all"
              rows={5}
              placeholder="Explain why this rating is unfair..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="p-4 border-2 border-dashed border-slate-800 rounded-xl hover:border-[#08d9d6] transition-colors group cursor-pointer text-center">
            <Paperclip className="h-6 w-6 text-slate-500 mx-auto mb-2 group-hover:text-[#08d9d6]" />
            <p className="text-sm text-slate-400">Attach Evidence (Photos/Timestamps)</p>
          </div>

          <button 
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-[#b822e4] to-[#e97be4] text-white font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-[#b822e4]/20 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Processing...' : 'Submit to Mediation'}
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

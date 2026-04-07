'use client'
import { useState } from 'react'
import { ArrowLeftRight } from 'lucide-react'

interface Props {
  beforeUrl: string
  afterUrl: string
  title: string
}

export default function BeforeAfterShowcase({ beforeUrl, afterUrl, title }: Props) {
  const [view, setView] = useState<'before' | 'after' | 'split'>('split')

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(['before', 'split', 'after'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors capitalize ${
                view === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {v === 'split' ? <ArrowLeftRight className="h-3.5 w-3.5" /> : v}
            </button>
          ))}
        </div>
      </div>
      <div className={`grid gap-3 ${view === 'split' ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {(view === 'before' || view === 'split') && (
          <div>
            {view === 'split' && <p className="text-xs text-gray-500 mb-1 font-medium">Before</p>}
            <img src={beforeUrl} alt="Before" className="w-full aspect-video object-cover rounded-xl" />
          </div>
        )}
        {(view === 'after' || view === 'split') && (
          <div>
            {view === 'split' && <p className="text-xs text-gray-500 mb-1 font-medium">After</p>}
            <img src={afterUrl} alt="After" className="w-full aspect-video object-cover rounded-xl" />
          </div>
        )}
      </div>
    </div>
  )
}

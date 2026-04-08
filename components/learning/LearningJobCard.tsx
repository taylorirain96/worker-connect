'use client'

import type { LearningJob } from '@/types'

interface LearningJobCardProps {
  job: LearningJob
  onApply?: (jobId: string) => void
  applied?: boolean
}

export default function LearningJobCard({ job, onApply, applied }: LearningJobCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-gray-900">{job.title}</h3>
          <p className="text-sm text-gray-500">{job.location}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-green-600">${job.rate}/hr</p>
          {job.certificationEligible && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
              🎓 Certification
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-blue-50 rounded-lg p-2">
          <p className="text-xs text-blue-500 font-medium">Skill Being Taught</p>
          <p className="text-blue-900 font-semibold">{job.skillBeingTaught}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-2">
          <p className="text-xs text-purple-500 font-medium">Required Skill</p>
          <p className="text-purple-900 font-semibold">{job.requiredSkill}</p>
        </div>
      </div>

      {job.description && (
        <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
        <span>
          Est. {job.learningArrangement?.estimatedHours ?? 0}h training
          · Cert on {job.skillGainedUpon}
        </span>
        <span>{new Date(job.createdAt).toLocaleDateString()}</span>
      </div>

      {onApply && (
        <button
          onClick={() => onApply(job.id)}
          disabled={applied}
          className={`w-full text-sm font-semibold rounded-lg px-4 py-2 transition-colors ${
            applied
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {applied ? 'Applied ✓' : 'Apply to Learn'}
        </button>
      )}
    </div>
  )
}

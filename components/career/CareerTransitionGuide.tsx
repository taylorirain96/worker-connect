'use client'

import type { CareerPath } from '@/types'

interface CareerTransitionGuideProps {
  path: CareerPath
}

export default function CareerTransitionGuide({ path }: CareerTransitionGuideProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-semibold text-sm">
          {path.fromSkill}
        </div>
        <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-300 to-purple-300" />
        <div className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg font-semibold text-sm">
          {path.toSkill}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-green-800 font-bold text-lg">{path.successRate}%</p>
          <p className="text-green-600 text-xs">Success Rate</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-blue-800 font-bold text-lg">{path.averageTimeToComplete}mo</p>
          <p className="text-blue-600 text-xs">Avg Time</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Your Path</h3>
        {path.steps.map((step, i) => (
          <div key={step.step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </div>
              {i < path.steps.length - 1 && <div className="w-0.5 flex-1 bg-blue-200 mt-1" />}
            </div>
            <div className="pb-4">
              <p className="font-medium text-gray-900 text-sm">{step.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">Est. {step.timeEstimate}</p>
              {step.skillsNeeded.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {step.skillsNeeded.map((s, j) => (
                    <span key={j} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

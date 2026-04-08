'use client'

interface SupervisorFeedbackProps {
  feedback: string
  supervisorName?: string
  score: number
  certifying?: boolean
}

export default function SupervisorFeedback({
  feedback,
  supervisorName,
  score,
  certifying,
}: SupervisorFeedbackProps) {
  const color =
    score >= 80 ? 'text-green-600' : score >= 50 ? 'text-blue-600' : 'text-red-600'

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-900">Supervisor Feedback</p>
          {supervisorName && <p className="text-xs text-gray-500">by {supervisorName}</p>}
        </div>
        <div className="text-right">
          <p className={`text-2xl font-bold ${color}`}>{score}</p>
          <p className="text-xs text-gray-400">/ 100</p>
        </div>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-blue-500' : 'bg-red-500'}`}
          style={{ width: `${score}%` }}
        />
      </div>
      {feedback && (
        <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{feedback}</p>
      )}
      {certifying && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <p className="text-green-700 font-semibold text-sm">🎓 Skill Certified by Supervisor</p>
        </div>
      )}
    </div>
  )
}

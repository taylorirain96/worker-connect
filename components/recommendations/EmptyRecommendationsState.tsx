import { Briefcase, Lightbulb } from 'lucide-react'

export default function EmptyRecommendationsState() {
  return (
    <div className="text-center py-16 px-4">
      <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
        <Briefcase className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Recommendations Yet</h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">Complete your profile and set your skills to get personalized job matches.</p>
      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 max-w-sm mx-auto text-left">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Tips</span>
        </div>
        <ul className="space-y-1 text-sm text-amber-600 dark:text-amber-400">
          <li>• Add your skills and certifications</li>
          <li>• Set your location and availability</li>
          <li>• Upload portfolio photos</li>
        </ul>
      </div>
    </div>
  )
}

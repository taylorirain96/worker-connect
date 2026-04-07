import type { WorkerPortfolio } from '@/types/reputation'

interface Props {
  portfolio: WorkerPortfolio
}

export default function PortfolioStats({ portfolio }: Props) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
        <p className="text-2xl font-bold text-gray-900">{portfolio.totalProjects}</p>
        <p className="text-xs text-gray-500 mt-1">Total Projects</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
        <p className="text-2xl font-bold text-yellow-600">{portfolio.avgRating > 0 ? portfolio.avgRating.toFixed(1) : '—'}</p>
        <p className="text-xs text-gray-500 mt-1">Avg Rating</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
        <p className="text-lg font-bold text-blue-600">
          {portfolio.featuredItem ? '⭐' : '—'}
        </p>
        <p className="text-xs text-gray-500 mt-1">Featured Work</p>
      </div>
    </div>
  )
}

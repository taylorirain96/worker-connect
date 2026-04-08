import type { WorkerPortfolio } from '@/types/reputation'
import PortfolioCard from './PortfolioCard'

interface Props {
  portfolio: WorkerPortfolio
}

export default function PortfolioGallery({ portfolio }: Props) {
  if (portfolio.items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-4xl mb-2">🖼</p>
        <p>No portfolio items yet.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {portfolio.items.map(item => (
        <PortfolioCard key={item.id} item={item} />
      ))}
    </div>
  )
}

import type { PortfolioItem } from '@/types/reputation'

interface Props {
  item: PortfolioItem
}

export default function BeforeAfterShowcase({ item }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <h3 className="font-semibold text-gray-900">{item.title}</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500 uppercase">Before</p>
          {item.beforeImageUrl ? (
            <img src={item.beforeImageUrl} alt="Before" className="w-full h-36 object-cover rounded-lg" />
          ) : (
            <div className="w-full h-36 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">No image</div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500 uppercase">After</p>
          {item.afterImageUrl ? (
            <img src={item.afterImageUrl} alt="After" className="w-full h-36 object-cover rounded-lg" />
          ) : (
            <div className="w-full h-36 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">No image</div>
          )}
        </div>
      </div>
    </div>
  )
}

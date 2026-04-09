'use client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import type { PeerComparison } from '@/types'

interface Props { data: PeerComparison[] }

function PercentileBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${value >= 75 ? 'bg-emerald-500' : value >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-medium w-12 text-right">{value}th</span>
    </div>
  )
}

export default function PeerComparisonTable({ data }: Props) {
  return (
    <Card>
      <CardHeader><CardTitle>Peer Comparison</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <th className="pb-2 font-medium">Metric</th>
                <th className="pb-2 font-medium text-right">You</th>
                <th className="pb-2 font-medium text-right">Avg</th>
                <th className="pb-2 font-medium">Percentile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {data.map((row) => (
                <tr key={row.metric}>
                  <td className="py-2 text-gray-900 dark:text-white">{row.metric}</td>
                  <td className="py-2 text-right font-semibold text-primary-600">{row.workerValue}</td>
                  <td className="py-2 text-right text-gray-500 dark:text-gray-400">{row.peerAvg}</td>
                  <td className="py-2 pl-4"><PercentileBar value={row.percentile} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

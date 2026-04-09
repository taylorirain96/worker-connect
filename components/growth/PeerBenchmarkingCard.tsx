'use client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import type { PeerComparison } from '@/types'

interface Props { data: PeerComparison[] }

function Percentile({ value }: { value: number }) {
  const color = value >= 75 ? 'text-emerald-500' : value >= 50 ? 'text-amber-500' : 'text-rose-500'
  return <span className={`font-bold ${color}`}>{value}th</span>
}

export default function PeerBenchmarkingCard({ data }: Props) {
  return (
    <Card>
      <CardHeader><CardTitle>Peer Benchmarking</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <th className="pb-2 font-medium">Metric</th>
                <th className="pb-2 font-medium text-right">You</th>
                <th className="pb-2 font-medium text-right">Peers Avg</th>
                <th className="pb-2 font-medium text-right">Percentile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {data.map((row) => (
                <tr key={row.metric}>
                  <td className="py-2 text-gray-900 dark:text-white">{row.metric}</td>
                  <td className="py-2 text-right font-medium text-gray-900 dark:text-white">{row.workerValue}</td>
                  <td className="py-2 text-right text-gray-500 dark:text-gray-400">{row.peerAvg}</td>
                  <td className="py-2 text-right"><Percentile value={row.percentile} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

import type { MoverLeaderboardEntry } from '@/types/reputation'

interface Props {
  entries: MoverLeaderboardEntry[]
}

export default function MoverLeaderboard({ entries }: Props) {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Top Movers</h2>
      </div>
      {entries.length === 0 ? (
        <div className="px-6 py-8 text-center text-gray-400 text-sm">No movers yet</div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="text-xs text-gray-500 bg-gray-50">
              <th className="px-6 py-3 text-left">Rank</th>
              <th className="px-6 py-3 text-left">Worker</th>
              <th className="px-6 py-3 text-left">Target City</th>
              <th className="px-6 py-3 text-right">Success Rate</th>
              <th className="px-6 py-3 text-right">Completion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {entries.map(entry => (
              <tr key={entry.workerId} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-bold text-gray-400">#{entry.rank}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {entry.avatar ? (
                      <img src={entry.avatar} alt={entry.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">
                        {entry.name.charAt(0)}
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-900">{entry.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{entry.targetRelocationCity}</td>
                <td className="px-6 py-4 text-right text-sm font-semibold text-green-600">{entry.relocationSuccessRate}%</td>
                <td className="px-6 py-4 text-right text-sm text-gray-600">{entry.completionRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

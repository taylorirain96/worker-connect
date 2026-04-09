'use client'
import { AlertTriangle, ArrowUp, Info } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

interface Improvement { area: string; priority: 'high' | 'medium' | 'low'; recommendation: string; impact: number }
interface Props { improvements: Improvement[] }

const PRIORITY_STYLES = {
  high:   { badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300',     icon: AlertTriangle, iconColor: 'text-rose-500' },
  medium: { badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300', icon: ArrowUp,       iconColor: 'text-amber-500' },
  low:    { badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',     icon: Info,          iconColor: 'text-blue-500' },
}

export default function ImprovementSuggestions({ improvements }: Props) {
  return (
    <Card>
      <CardHeader><CardTitle>Improvement Opportunities</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-3">
          {improvements.map((item) => {
            const { badge, icon: Icon, iconColor } = PRIORITY_STYLES[item.priority]
            return (
              <div key={item.area} className="flex items-start gap-3 p-3 border border-gray-100 dark:border-gray-700 rounded-lg">
                <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${iconColor}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.area}</p>
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${badge}`}>{item.priority}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.recommendation}</p>
                </div>
                <span className="text-xs font-bold text-emerald-500 shrink-0">+{item.impact}%</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

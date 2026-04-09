'use client'
import { Star, Award } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

interface Strength { skill: string; score: number; description: string }
interface Props { strengths: Strength[] }

export default function StrengthsHighlight({ strengths }: Props) {
  return (
    <Card>
      <CardHeader><CardTitle>Top Strengths</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-3">
          {strengths.map((s, i) => (
            <div key={s.skill} className="flex items-start gap-3">
              <div className={`mt-0.5 p-1.5 rounded-lg ${i === 0 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-gray-50 dark:bg-gray-700'}`}>
                {i === 0 ? <Award className="h-4 w-4 text-amber-500" /> : <Star className="h-4 w-4 text-gray-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{s.skill}</p>
                  <span className="text-sm font-bold text-emerald-500">{s.score}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

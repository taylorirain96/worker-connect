'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

const HOURLY_DATA = [
  { hour: '6am', jobs: 1 }, { hour: '8am', jobs: 3 }, { hour: '10am', jobs: 5 },
  { hour: '12pm', jobs: 4 }, { hour: '2pm', jobs: 6 }, { hour: '4pm', jobs: 7 },
  { hour: '6pm', jobs: 3 }, { hour: '8pm', jobs: 1 },
]

export default function SuccessPatternAnalysis() {
  return (
    <Card>
      <CardHeader><CardTitle>Success Patterns</CardTitle></CardHeader>
      <CardContent>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Best time to work (jobs completed by hour)</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={HOURLY_DATA} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.6} />
            <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--tooltip-bg, #fff)', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} />
            <Bar dataKey="jobs" name="Jobs" fill="#6366f1" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

'use client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

const MOCK_DATA = [
  { month: 'Jan', rating: 4.4 },
  { month: 'Feb', rating: 4.5 },
  { month: 'Mar', rating: 4.6 },
  { month: 'Apr', rating: 4.5 },
  { month: 'May', rating: 4.7 },
  { month: 'Jun', rating: 4.8 },
  { month: 'Jul', rating: 4.8 },
  { month: 'Aug', rating: 4.9 },
]

export default function RatingTrajectoryChart() {
  return (
    <Card>
      <CardHeader><CardTitle>Rating Trajectory</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={MOCK_DATA} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.6} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis domain={[4.0, 5.0]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--tooltip-bg, #fff)', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} />
            <ReferenceLine y={4.8} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Pro Threshold', position: 'right', fontSize: 10, fill: '#10b981' }} />
            <Line type="monotone" dataKey="rating" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: '#f59e0b' }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

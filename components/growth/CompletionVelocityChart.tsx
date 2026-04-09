'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

const MOCK_DATA = [
  { month: 'Jan', completed: 7, target: 8 },
  { month: 'Feb', completed: 9, target: 8 },
  { month: 'Mar', completed: 6, target: 8 },
  { month: 'Apr', completed: 11, target: 10 },
  { month: 'May', completed: 8, target: 10 },
  { month: 'Jun', completed: 12, target: 10 },
]

export default function CompletionVelocityChart() {
  return (
    <Card>
      <CardHeader><CardTitle>Completion Velocity</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={MOCK_DATA} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.6} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--tooltip-bg, #fff)', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} />
            <Bar dataKey="completed" name="Completed" fill="#6366f1" radius={[4,4,0,0]} />
            <Bar dataKey="target" name="Target" fill="#e5e7eb" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

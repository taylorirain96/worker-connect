'use client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'

const MOCK_DATA = [
  { name: 'Plumbing',   value: 6720, color: '#6366f1' },
  { name: 'Electrical', value: 8250, color: '#22d3ee' },
  { name: 'HVAC',       value: 5400, color: '#f59e0b' },
  { name: 'Carpentry',  value: 3150, color: '#10b981' },
  { name: 'General',    value: 2760, color: '#ef4444' },
]

export default function EarningsBreakdownPie() {
  return (
    <Card>
      <CardHeader><CardTitle>Earnings by Category</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={MOCK_DATA} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name">
              {MOCK_DATA.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
            </Pie>
            <Tooltip formatter={(v) => [formatCurrency(v as number), 'Earnings']} contentStyle={{ backgroundColor: 'var(--tooltip-bg, #fff)', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

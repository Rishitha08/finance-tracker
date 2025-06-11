'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface MonthlyData {
  month: string
  amount: number
}

interface MonthlyExpenseChartProps {
  data: MonthlyData[]
}

export default function MonthlyExpenseChart({ data }: MonthlyExpenseChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          dataKey="month" 
          tick={{ fill: '#64748b', fontSize: 12 }}
          axisLine={{ stroke: '#cbd5e1' }}
        />
        <YAxis 
          tick={{ fill: '#64748b', fontSize: 12 }}
          axisLine={{ stroke: '#cbd5e1' }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: number) => [
            new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
            }).format(value),
            'Amount'
          ]}
        />
        <Bar 
          dataKey="amount" 
          fill="url(#samsungGradient)" 
          radius={[4, 4, 0, 0]}
        />
        <defs>
          <linearGradient id="samsungGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  )
}

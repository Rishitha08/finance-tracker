'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface BudgetData {
  category: string
  budget: number
  spent: number
}

interface BudgetComparisonChartProps {
  data: BudgetData[]
}

export default function BudgetComparisonChart({ data }: BudgetComparisonChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          dataKey="category" 
          tick={{ fill: '#64748b', fontSize: 12 }}
          axisLine={{ stroke: '#cbd5e1' }}
        />
        <YAxis 
          tick={{ fill: '#64748b', fontSize: 12 }}
          axisLine={{ stroke: '#cbd5e1' }}
        />
        <Tooltip 
          formatter={(value: number, name: string) => [
            formatCurrency(value),
            name === 'budget' ? 'Budget' : 'Spent'
          ]}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Legend />
        <Bar dataKey="budget" fill="#10b981" name="Budget" radius={[4, 4, 0, 0]} />
        <Bar dataKey="spent" fill="#ef4444" name="Spent" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

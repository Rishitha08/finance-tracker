'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface CategoryData {
  category: string
  amount: number
  percentage: number
}

interface CategoryPieChartProps {
  data: CategoryData[]
}

const COLORS = [
  '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', 
  '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'
]

export default function CategoryPieChart({ data }: CategoryPieChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Custom label function to prevent text hiding
  const renderCustomLabel = ({ category, percentage, cx, cy, midAngle, innerRadius, outerRadius }: any) => {
    // Only show labels for slices larger than 5% to avoid overcrowding
    if (percentage < 5) return null
    
    const RADIAN = Math.PI / 180
    // Position labels outside the pie chart
    const radius = outerRadius + 30
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="#374151"
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="500"
      >
        {`${category}: ${percentage.toFixed(1)}%`}
      </text>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart margin={{ top: 40, right: 80, bottom: 40, left: 80 }}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={120}
          innerRadius={50}
          dataKey="amount"
          nameKey="category"
          label={renderCustomLabel}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number) => [formatCurrency(value), 'Amount']}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            fontSize: '14px'
          }}
        />
        <Legend 
          wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
          iconType="circle"
          layout="horizontal"
          align="center"
          verticalAlign="bottom"
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

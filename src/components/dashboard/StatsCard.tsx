import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: number
  change?: number
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
}

export default function StatsCard({ title, value, change, icon, trend = 'neutral' }: StatsCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      default: return 'text-slate-600'
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              {formatCurrency(value)}
            </p>
            {change !== undefined && (
              <p className={`text-sm mt-1 ${getTrendColor()}`}>
                {change > 0 ? '+' : ''}{change.toFixed(1)}%
              </p>
            )}
          </div>
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useMemo } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface TierDistributionProps {
  data: Array<{ tier: string; count: number }>
}

const TIER_COLORS: Record<string, string> = {
  none: "#6b7280",
  starter: "#3b82f6",
  pro: "#8b5cf6",
  premium: "#f59e0b",
  ultra: "#f43f5e",
  comped: "#22c55e",
}

export function TierDistribution({ data }: TierDistributionProps) {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      name: item.tier.charAt(0).toUpperCase() + item.tier.slice(1),
      value: item.count,
      color: TIER_COLORS[item.tier.toLowerCase()] || "#6b7280",
    }))
  }, [data])

  const total = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0)
  }, [chartData])

  if (data.length === 0 || total === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-muted-foreground">
        No data available
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={70}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                const percentage = ((data.value / total) * 100).toFixed(1)
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: data.color }}
                      />
                      <span className="font-medium">{data.name}</span>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {data.value} users ({percentage}%)
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap justify-center gap-3">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5 text-xs">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-muted-foreground">
              {item.name}: {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

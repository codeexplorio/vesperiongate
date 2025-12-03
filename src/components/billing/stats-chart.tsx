"use client"

import { useMemo } from "react"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface StatsChartProps {
  data: Array<{ date: string; count: number }>
  color?: string
}

export function StatsChart({ data, color = "hsl(var(--primary))" }: StatsChartProps) {
  const chartData = useMemo(() => {
    return [...data]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((item) => ({
        date: item.date,
        value: item.count,
        label: new Date(item.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      }))
  }, [data])

  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-muted-foreground">
        No data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id={`gradient-${color.replace(/[^a-z0-9]/gi, "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="label"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
          tick={{ fill: "hsl(var(--muted-foreground))" }}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{payload[0].payload.label}</span>
                    <span className="text-muted-foreground">Count</span>
                    <span className="font-medium">{payload[0].value}</span>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#gradient-${color.replace(/[^a-z0-9]/gi, "")})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

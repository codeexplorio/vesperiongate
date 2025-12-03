"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  TrendingUp,
  DollarSign,
  Users,
  Zap,
  Camera,
  Boxes,
  Video,
  HardDrive,
} from "lucide-react"
import { formatNumber, formatBytes } from "@/lib/utils"
import { StatsChart } from "@/components/billing/stats-chart"
import { TierDistribution } from "@/components/billing/tier-distribution"

interface AnalyticsData {
  overview: {
    totalUsers: number
    usersToday: number
    usersThisWeek: number
    usersThisMonth: number
    userGrowthRate: number
    activeSubscriptions: number
    totalPhotos: number
    photosToday: number
    photosThisWeek: number
    totalModels: number
    totalVideos: number
    totalCreditsUsed: number
    totalStorage: string
    activeSessions: number
  }
  distributions: {
    tiers: Array<{ tier: string; count: number }>
    statuses: Array<{ status: string; count: number }>
    storageByType: Array<{ type: string; bytes: string; count: number }>
  }
  charts: {
    photosPerDay: Array<{ date: string; count: number }>
    signupsPerDay: Array<{ date: string; count: number }>
  }
}

const TIER_PRICING: Record<string, number> = {
  starter: 19,
  pro: 49,
  premium: 99,
  ultra: 199,
  comped: 0,
  none: 0,
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/billing/stats")
        if (!res.ok) throw new Error("Failed to fetch analytics")
        const result = await res.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Card className="p-6">
          <p className="text-destructive">Error: {error}</p>
        </Card>
      </div>
    )
  }

  // Calculate metrics
  const totalUsers = data?.overview.totalUsers || 1
  const conversionRate = data
    ? ((data.overview.activeSubscriptions / totalUsers) * 100).toFixed(1)
    : "0"
  const avgPhotosPerUser = data
    ? (data.overview.totalPhotos / totalUsers).toFixed(1)
    : "0"
  const avgCreditsPerUser = data
    ? Math.round(data.overview.totalCreditsUsed / totalUsers)
    : 0

  const estimatedMRR = data
    ? data.distributions.tiers.reduce((sum, t) => {
        return sum + (TIER_PRICING[t.tier.toLowerCase()] || 0) * t.count
      }, 0)
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics & Insights</h1>
        <p className="text-muted-foreground">
          Key performance metrics and business insights
        </p>
      </div>

      {/* Key Business Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        {loading ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{conversionRate}%</div>
                <p className="text-xs text-muted-foreground">
                  Users with active subscription
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estimated MRR</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${formatNumber(estimatedMRR)}</div>
                <p className="text-xs text-muted-foreground">Monthly recurring revenue</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Photos/User</CardTitle>
                <Camera className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgPhotosPerUser}</div>
                <p className="text-xs text-muted-foreground">Photos per user</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Credits Used</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(avgCreditsPerUser)}</div>
                <p className="text-xs text-muted-foreground">Credits per user</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Growth Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        {loading ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : data ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">User Growth</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.overview.userGrowthRate >= 0 ? "+" : ""}
                  {data.overview.userGrowthRate}%
                </div>
                <p className="text-xs text-muted-foreground">Month over month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Daily Active</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(data.overview.activeSessions)}
                </div>
                <p className="text-xs text-muted-foreground">Active sessions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Weekly Signups</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(data.overview.usersThisWeek)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.overview.usersToday} today
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Weekly Photos</CardTitle>
                <Camera className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(data.overview.photosThisWeek)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.overview.photosToday} today
                </p>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      {/* Trend Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Signups</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[250px]" />
            ) : data ? (
              <StatsChart
                data={data.charts.signupsPerDay}
                color="hsl(var(--primary))"
              />
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Photo Generations</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[250px]" />
            ) : data ? (
              <StatsChart
                data={data.charts.photosPerDay}
                color="hsl(var(--chart-2))"
              />
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Distribution Charts */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Users by Tier</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[200px]" />
            ) : data ? (
              <TierDistribution data={data.distributions.tiers} />
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Users by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[200px]" />
            ) : data ? (
              <TierDistribution
                data={data.distributions.statuses.map((s) => ({
                  tier: s.status.replace("_", " "),
                  count: s.count,
                }))}
              />
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Storage by Type</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[200px]" />
            ) : data ? (
              <TierDistribution
                data={data.distributions.storageByType.map((s) => ({
                  tier: s.type,
                  count: Number(BigInt(s.bytes) / 1024n / 1024n), // MB
                }))}
              />
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Tier Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Tier Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-48" />
          ) : data ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.distributions.tiers.map((t) => {
                const revenue = (TIER_PRICING[t.tier.toLowerCase()] || 0) * t.count
                const percent = ((t.count / totalUsers) * 100).toFixed(1)
                return (
                  <div key={t.tier} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-semibold capitalize">{t.tier}</span>
                      <span className="text-sm text-muted-foreground">{percent}%</span>
                    </div>
                    <div className="text-2xl font-bold mb-1">{formatNumber(t.count)}</div>
                    <p className="text-sm text-muted-foreground">
                      users - ${formatNumber(revenue)}/mo
                    </p>
                  </div>
                )
              })}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Content Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Content Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <>
                <Skeleton className="h-8" />
                <Skeleton className="h-8" />
                <Skeleton className="h-8" />
                <Skeleton className="h-8" />
              </>
            ) : data ? (
              <>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-muted-foreground" />
                    <span>Total Photos</span>
                  </div>
                  <span className="text-lg font-semibold">
                    {formatNumber(data.overview.totalPhotos)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Boxes className="h-4 w-4 text-muted-foreground" />
                    <span>AI Models</span>
                  </div>
                  <span className="text-lg font-semibold">
                    {formatNumber(data.overview.totalModels)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-muted-foreground" />
                    <span>Videos</span>
                  </div>
                  <span className="text-lg font-semibold">
                    {formatNumber(data.overview.totalVideos)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    <span>Total Credits Used</span>
                  </div>
                  <span className="text-lg font-semibold text-amber-500">
                    {formatNumber(data.overview.totalCreditsUsed)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                    <span>Total Storage</span>
                  </div>
                  <span className="text-lg font-semibold">
                    {formatBytes(BigInt(data.overview.totalStorage))}
                  </span>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <>
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </>
            ) : data ? (
              <>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Active Users</span>
                    <span className="text-muted-foreground">
                      {formatNumber(data.overview.activeSessions)} /{" "}
                      {formatNumber(totalUsers)}
                    </span>
                  </div>
                  <Progress
                    value={(data.overview.activeSessions / totalUsers) * 100}
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Paid Users</span>
                    <span className="text-muted-foreground">
                      {formatNumber(data.overview.activeSubscriptions)} /{" "}
                      {formatNumber(totalUsers)}
                    </span>
                  </div>
                  <Progress
                    value={(data.overview.activeSubscriptions / totalUsers) * 100}
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Weekly Growth</span>
                    <span className="text-muted-foreground">
                      +{formatNumber(data.overview.usersThisWeek)} users
                    </span>
                  </div>
                  <Progress
                    value={Math.min(
                      (data.overview.usersThisWeek / totalUsers) * 100 * 10,
                      100
                    )}
                    className="h-2"
                  />
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

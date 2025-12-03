"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Users,
  Camera,
  HardDrive,
  CreditCard,
  TrendingUp,
  Activity,
  Boxes,
  Zap,
} from "lucide-react"
import { formatBytes, formatNumber, timeAgo } from "@/lib/utils"
import { StatsChart } from "@/components/billing/stats-chart"
import { TierDistribution } from "@/components/billing/tier-distribution"
import { RecentActivity } from "@/components/billing/recent-activity"

interface StatsData {
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
  activity: {
    recentSignups: Array<{
      id: string
      name: string
      email: string
      subscription_tier: string | null
      subscription_status: string
      createdAt: string
      _count: { photos: number; models: number }
    }>
    recentSessions: Array<{
      id: string
      userId: string
      userName: string
      userEmail: string
      ipAddress: string | null
      userAgent: string | null
      createdAt: string
      expiresAt: string
    }>
  }
  topUsers: Array<{
    id: string
    name: string
    email: string
    subscription_tier: string | null
    storage_used_bytes: string
    credits: number
    _count: { photos: number; models: number }
  }>
  charts: {
    photosPerDay: Array<{ date: string; count: number }>
    signupsPerDay: Array<{ date: string; count: number }>
  }
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  trend?: number
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(subtitle || trend !== undefined) && (
          <p className="text-xs text-muted-foreground">
            {trend !== undefined && (
              <span className={trend >= 0 ? "text-green-500" : "text-red-500"}>
                {trend >= 0 ? "+" : ""}
                {trend.toFixed(1)}%{" "}
              </span>
            )}
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-1" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  )
}

export default function BillingDashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/billing/stats")
        if (!res.ok) throw new Error("Failed to fetch stats")
        const data = await res.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            LensCherry application metrics and insights
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : stats ? (
          <>
            <StatCard
              title="Total Users"
              value={formatNumber(stats.overview.totalUsers)}
              subtitle={`+${stats.overview.usersToday} today`}
              icon={Users}
              trend={stats.overview.userGrowthRate}
            />
            <StatCard
              title="Active Subscriptions"
              value={formatNumber(stats.overview.activeSubscriptions)}
              subtitle={`${((stats.overview.activeSubscriptions / stats.overview.totalUsers) * 100).toFixed(1)}% conversion`}
              icon={CreditCard}
            />
            <StatCard
              title="Photos Generated"
              value={formatNumber(stats.overview.totalPhotos)}
              subtitle={`+${stats.overview.photosToday} today`}
              icon={Camera}
            />
            <StatCard
              title="Total Storage"
              value={formatBytes(BigInt(stats.overview.totalStorage))}
              subtitle={`${stats.overview.activeSessions} active sessions`}
              icon={HardDrive}
            />
          </>
        ) : null}
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : stats ? (
          <>
            <StatCard
              title="AI Models"
              value={formatNumber(stats.overview.totalModels)}
              icon={Boxes}
            />
            <StatCard
              title="Credits Used"
              value={formatNumber(stats.overview.totalCreditsUsed)}
              icon={Zap}
            />
            <StatCard
              title="Weekly Signups"
              value={formatNumber(stats.overview.usersThisWeek)}
              subtitle={`${stats.overview.usersToday} today`}
              icon={TrendingUp}
            />
            <StatCard
              title="Weekly Photos"
              value={formatNumber(stats.overview.photosThisWeek)}
              subtitle={`${stats.overview.photosToday} today`}
              icon={Activity}
            />
          </>
        ) : null}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>User Signups</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[200px]" />
            ) : stats ? (
              <StatsChart
                data={stats.charts.signupsPerDay}
                color="hsl(var(--primary))"
              />
            ) : null}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Photo Generations</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[200px]" />
            ) : stats ? (
              <StatsChart
                data={stats.charts.photosPerDay}
                color="hsl(var(--chart-2))"
              />
            ) : null}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Users by Tier</CardTitle>
            <CardDescription>Subscription distribution</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[200px]" />
            ) : stats ? (
              <TierDistribution data={stats.distributions.tiers} />
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Signups</CardTitle>
              <CardDescription>New users in the last 7 days</CardDescription>
            </div>
            <Link
              href="/billing/users"
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : stats ? (
              <RecentActivity
                items={stats.activity.recentSignups.map((u) => ({
                  id: u.id,
                  name: u.name,
                  email: u.email,
                  subtitle: timeAgo(u.createdAt),
                  href: `/billing/users/${u.id}`,
                }))}
              />
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Sessions</CardTitle>
              <CardDescription>Latest login activity</CardDescription>
            </div>
            <Link
              href="/billing/activity"
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : stats ? (
              <RecentActivity
                items={stats.activity.recentSessions.map((s) => ({
                  id: s.id,
                  name: s.userName,
                  email: s.userEmail,
                  subtitle: `${timeAgo(s.createdAt)} - ${s.ipAddress || "Unknown IP"}`,
                  href: `/billing/users/${s.userId}`,
                }))}
              />
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Top Users */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Top Users by Storage</CardTitle>
            <CardDescription>Users with the most storage usage</CardDescription>
          </div>
          <Link
            href="/billing/storage"
            className="text-sm text-primary hover:underline"
          >
            View storage analytics
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : stats ? (
            <div className="space-y-4">
              {stats.topUsers.slice(0, 5).map((user) => (
                <Link
                  key={user.id}
                  href={`/billing/users/${user.id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user._count.photos} photos, {user._count.models} models
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatBytes(BigInt(user.storage_used_bytes))}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatNumber(user.credits)} credits
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

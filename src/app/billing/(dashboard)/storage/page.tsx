"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ChevronLeft, ChevronRight, HardDrive, Database, TrendingUp } from "lucide-react"
import { formatBytes, formatNumber, getTierColor } from "@/lib/utils"
import { StatsChart } from "@/components/billing/stats-chart"
import { TierDistribution } from "@/components/billing/tier-distribution"

interface StorageData {
  overview: {
    totalStorage: string
    avgStoragePerUser: string
    maxStorageUser: string
  }
  byType: Array<{
    type: string
    totalBytes: string
    count: number
    avgBytes: string
  }>
  byTier: Array<{
    tier: string
    totalBytes: string
    userCount: number
    avgBytes: string
  }>
  topUsers: Array<{
    id: string
    name: string
    email: string
    subscription_tier: string | null
    storage_used_bytes: string
    storage_limit_bytes: string
    usagePercent: number
    _count: {
      photos: number
      models: number
      storage_items: number
    }
  }>
  growth: Array<{
    date: string
    totalBytes: string
    itemsCount: number
  }>
  sizeDistribution: Array<{
    category: string
    count: number
    totalBytes: string
  }>
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const TYPE_COLORS: Record<string, string> = {
  photo: "hsl(var(--primary))",
  model: "hsl(var(--chart-2))",
  training: "hsl(var(--chart-3))",
  video: "hsl(var(--chart-4))",
}

export default function StoragePage() {
  const router = useRouter()
  const [data, setData] = useState<StorageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const fetchStorage = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/billing/storage?page=${page}`)
      if (!res.ok) throw new Error("Failed to fetch storage")
      const result = await res.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchStorage()
  }, [fetchStorage])

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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Storage Analytics</h1>
        <p className="text-muted-foreground">
          Monitor storage usage across users and content types
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {loading ? (
          <>
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </>
        ) : data ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Storage</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatBytes(BigInt(data.overview.totalStorage))}
                </div>
                <p className="text-xs text-muted-foreground">Across all users</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average per User</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatBytes(BigInt(data.overview.avgStoragePerUser))}
                </div>
                <p className="text-xs text-muted-foreground">Per active user</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Largest User</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatBytes(BigInt(data.overview.maxStorageUser))}
                </div>
                <p className="text-xs text-muted-foreground">Maximum usage</p>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Storage by Type</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[200px]" />
            ) : data ? (
              <TierDistribution
                data={data.byType.map((t) => ({
                  tier: t.type,
                  count: Number(BigInt(t.totalBytes) / 1024n / 1024n), // MB for display
                }))}
              />
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Storage by Tier</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[200px]" />
            ) : data ? (
              <TierDistribution
                data={data.byTier.map((t) => ({
                  tier: t.tier,
                  count: Number(BigInt(t.totalBytes) / 1024n / 1024n),
                }))}
              />
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Storage Added</CardTitle>
            <CardDescription>Last 30 days (MB)</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[200px]" />
            ) : data ? (
              <StatsChart
                data={data.growth.map((g) => ({
                  date: g.date,
                  count: Number(BigInt(g.totalBytes) / 1024n / 1024n),
                }))}
                color="hsl(var(--primary))"
              />
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Storage by Type Details */}
      <Card>
        <CardHeader>
          <CardTitle>Storage by Content Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <>
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </>
          ) : data ? (
            data.byType.map((type) => {
              const total = BigInt(data.overview.totalStorage)
              const typeBytes = BigInt(type.totalBytes)
              const percent = total > 0 ? Number((typeBytes * 100n) / total) : 0
              return (
                <div key={type.type} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize font-medium">{type.type}</span>
                    <span className="text-muted-foreground">
                      {formatBytes(typeBytes)} ({percent.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={percent} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(type.count)} items - Avg{" "}
                    {formatBytes(BigInt(type.avgBytes))}
                  </p>
                </div>
              )
            })
          ) : null}
        </CardContent>
      </Card>

      {/* Size Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>File Size Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-48" />
          ) : data ? (
            <div className="grid gap-4 md:grid-cols-5">
              {data.sizeDistribution.map((dist) => (
                <div
                  key={dist.category}
                  className="p-4 rounded-lg border text-center"
                >
                  <p className="text-2xl font-bold">{formatNumber(dist.count)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {dist.category}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(BigInt(dist.totalBytes))}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Top Users by Storage */}
      <Card>
        <CardHeader>
          <CardTitle>Top Users by Storage</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : data ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Used</TableHead>
                    <TableHead>Limit</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Content</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.topUsers.map((user) => {
                    const percent = user.usagePercent
                    let progressColor = ""
                    if (percent > 90) progressColor = "bg-red-500"
                    else if (percent > 70) progressColor = "bg-amber-500"

                    return (
                      <TableRow
                        key={user.id}
                        className="cursor-pointer"
                        onClick={() => router.push(`/billing/users/${user.id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {user.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getTierColor(user.subscription_tier || "none")}>
                            {user.subscription_tier || "None"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatBytes(BigInt(user.storage_used_bytes))}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatBytes(BigInt(user.storage_limit_bytes))}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={Math.min(percent, 100)}
                              className={`w-20 h-2 ${progressColor}`}
                            />
                            <span className="text-xs text-muted-foreground">
                              {percent.toFixed(0)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user._count.photos} photos, {user._count.models} models
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Page {data.pagination.page} of {data.pagination.totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= data.pagination.totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

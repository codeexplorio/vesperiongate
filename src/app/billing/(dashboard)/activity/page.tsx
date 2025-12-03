"use client"

import { useEffect, useState } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Camera, Activity, UserPlus } from "lucide-react"
import { formatNumber, timeAgo, getTierColor } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface ActivityData {
  summary: {
    sessionsToday: number
    sessionsWeek: number
    uniqueUsersToday: number
    uniqueUsersWeek: number
    photosToday: number
    photosWeek: number
    signupsToday: number
    signupsWeek: number
  }
  recentSessions: Array<{
    id: string
    type: string
    userId: string
    userName: string
    userEmail: string
    userTier: string | null
    ipAddress: string | null
    userAgent: string | null
    createdAt: string
    expiresAt: string
    isActive: boolean
  }>
  recentPhotos: Array<{
    id: string
    type: string
    userId: string
    userName: string
    userEmail: string
    modelName: string | null
    creditsUsed: number
    createdAt: string
  }>
  recentSignups: Array<{
    id: string
    type: string
    userName: string
    userEmail: string
    tier: string | null
    createdAt: string
  }>
  hourlyActivity: Array<{
    hour: number
    sessions: number
  }>
}

export default function ActivityPage() {
  const router = useRouter()
  const [data, setData] = useState<ActivityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchActivity() {
      try {
        const res = await fetch("/api/billing/activity")
        if (!res.ok) throw new Error("Failed to fetch activity")
        const result = await res.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }
    fetchActivity()
  }, [])

  // Format hourly data for chart
  const hourlyChartData = data
    ? Array.from({ length: 24 }, (_, i) => {
        const found = data.hourlyActivity.find((h) => h.hour === i)
        return {
          hour: `${i.toString().padStart(2, "0")}:00`,
          sessions: found?.sessions || 0,
        }
      })
    : []

  const parseDevice = (userAgent: string | null) => {
    if (!userAgent) return "Unknown"
    if (userAgent.includes("Chrome")) return "Chrome"
    if (userAgent.includes("Safari")) return "Safari"
    if (userAgent.includes("Firefox")) return "Firefox"
    if (userAgent.includes("Edge")) return "Edge"
    return "Other"
  }

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
        <h1 className="text-3xl font-bold tracking-tight">Activity</h1>
        <p className="text-muted-foreground">
          Monitor user activity, logins, and engagement
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {loading ? (
          <>
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </>
        ) : data ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sessions Today</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(data.summary.sessionsToday)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.summary.sessionsWeek} this week
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(data.summary.uniqueUsersToday)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.summary.uniqueUsersWeek} this week
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Photos Today</CardTitle>
                <Camera className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(data.summary.photosToday)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.summary.photosWeek} this week
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Signups Today</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(data.summary.signupsToday)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.summary.signupsWeek} this week
                </p>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      {/* Hourly Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sessions by Hour</CardTitle>
          <CardDescription>Last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[200px]" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hourlyChartData}>
                <XAxis
                  dataKey="hour"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  interval={2}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <p className="font-medium">{payload[0].payload.hour}</p>
                          <p className="text-sm text-muted-foreground">
                            {payload[0].value} sessions
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar
                  dataKey="sessions"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Activity Tabs */}
      <Tabs defaultValue="sessions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="photos">Photo Generations</TabsTrigger>
          <TabsTrigger value="signups">Signups</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : data ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Login</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recentSessions.map((session) => (
                      <TableRow
                        key={session.id}
                        className="cursor-pointer"
                        onClick={() => router.push(`/billing/users/${session.userId}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {session.userName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{session.userName}</p>
                              <p className="text-sm text-muted-foreground">
                                {session.userEmail}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getTierColor(session.userTier || "none")}>
                            {session.userTier || "None"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {session.ipAddress || "N/A"}
                        </TableCell>
                        <TableCell>{parseDevice(session.userAgent)}</TableCell>
                        <TableCell>
                          <Badge variant={session.isActive ? "success" : "secondary"}>
                            {session.isActive ? "Active" : "Expired"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {timeAgo(session.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos">
          <Card>
            <CardHeader>
              <CardTitle>Recent Photo Generations</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : data ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Generated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recentPhotos.map((photo) => (
                      <TableRow
                        key={photo.id}
                        className="cursor-pointer"
                        onClick={() => router.push(`/billing/users/${photo.userId}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {photo.userName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{photo.userName}</p>
                              <p className="text-sm text-muted-foreground">
                                {photo.userEmail}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{photo.modelName || "No model"}</TableCell>
                        <TableCell>
                          <Badge variant="info">{photo.creditsUsed} credits</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {timeAgo(photo.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signups">
          <Card>
            <CardHeader>
              <CardTitle>Recent Signups</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : data ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Signed Up</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recentSignups.map((signup) => (
                      <TableRow
                        key={signup.id}
                        className="cursor-pointer"
                        onClick={() => router.push(`/billing/users/${signup.id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {signup.userName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{signup.userName}</p>
                              <p className="text-sm text-muted-foreground">
                                {signup.userEmail}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getTierColor(signup.tier || "none")}>
                            {signup.tier || "None"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {timeAgo(signup.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

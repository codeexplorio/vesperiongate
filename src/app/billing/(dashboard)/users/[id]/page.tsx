"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Camera, Boxes, CreditCard, HardDrive, Clock, Activity } from "lucide-react"
import {
  formatBytes,
  formatNumber,
  formatDate,
  formatDateTime,
  timeAgo,
  getTierColor,
  getStatusColor,
} from "@/lib/utils"
import { StatsChart } from "@/components/billing/stats-chart"

interface UserDetail {
  user: {
    id: string
    name: string
    email: string
    image: string | null
    subscription_tier: string | null
    subscription_status: string
    is_comped: boolean
    credits: number
    models_limit: number
    storage_used_bytes: string
    storage_limit_bytes: string
    emailVerified: boolean
    createdAt: string
    updatedAt: string
    _count: {
      photos: number
      models: number
      sessions: number
      favorites: number
      storage_items: number
    }
    models: Array<{
      id: string
      name: string
      type: string
      status: string
      total_size_bytes: string
      created_at: string
      _count: { photos: number }
    }>
  }
  recentPhotos: Array<{
    id: string
    url: string
    thumbnail_url: string | null
    width: number
    height: number
    credits_used: number
    generation_time_ms: number | null
    created_at: string
    prompt: string
    model: { id: string; name: string } | null
  }>
  recentSessions: Array<{
    id: string
    ipAddress: string | null
    userAgent: string | null
    createdAt: string
    expiresAt: string
  }>
  creditTransactions: Array<{
    id: string
    amount: number
    balance_after: number
    type: string
    description: string
    created_at: string
  }>
  subscriptionHistory: Array<{
    id: string
    tier: string
    status: string
    billing_interval: string | null
    started_at: string
    ended_at: string | null
  }>
  storageBreakdown: Array<{
    type: string
    bytes: string
    count: number
  }>
  photosActivity: Array<{
    date: string
    count: number
  }>
  generationModes: Array<{
    mode: string
    count: number
  }>
  referenceImagesCount: number
}

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [data, setData] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`/api/billing/users/${userId}`)
        if (!res.ok) {
          if (res.status === 404) throw new Error("User not found")
          throw new Error("Failed to fetch user")
        }
        const result = await res.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [userId])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] gap-4">
        <p className="text-destructive">{error || "Failed to load user"}</p>
        <Button variant="outline" onClick={() => router.push("/billing/users")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to users
        </Button>
      </div>
    )
  }

  const { user } = data
  const storageUsed = BigInt(user.storage_used_bytes)
  const storageLimit = BigInt(user.storage_limit_bytes)
  const storagePercent = storageLimit > 0 ? Number((storageUsed * 100n) / storageLimit) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/billing/users")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Avatar className="h-16 w-16">
            {user.image && <AvatarImage src={user.image} alt={user.name} />}
            <AvatarFallback className="text-2xl">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className={getTierColor(user.subscription_tier || "none")}>
                {user.subscription_tier || "None"}
              </Badge>
              <Badge variant="outline" className={getStatusColor(user.subscription_status)}>
                {user.subscription_status.replace("_", " ")}
              </Badge>
              {user.is_comped && (
                <Badge variant="success">
                  Comped
                </Badge>
              )}
              {user.emailVerified && (
                <Badge variant="info">
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p>Joined {formatDate(user.createdAt)}</p>
          <p>Last updated {timeAgo(user.updatedAt)}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(user.credits)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Photos</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(user._count.photos)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Models</CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user._count.models} / {user.models_limit}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(user._count.sessions)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(storageUsed)}</div>
            <p className="text-xs text-muted-foreground">
              {storagePercent.toFixed(0)}% of {formatBytes(storageLimit)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ref. Images</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.referenceImagesCount)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="credits">Credits</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Activity Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Photo Generation</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <StatsChart data={data.photosActivity} color="hsl(var(--primary))" />
              </CardContent>
            </Card>

            {/* Storage Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Storage Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.storageBreakdown.map((item) => {
                  const bytes = BigInt(item.bytes)
                  const percent = storageUsed > 0 ? Number((bytes * 100n) / storageUsed) : 0
                  return (
                    <div key={item.type} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{item.type}</span>
                        <span className="text-muted-foreground">
                          {formatBytes(bytes)} ({item.count} items)
                        </span>
                      </div>
                      <Progress value={percent} className="h-2" />
                    </div>
                  )
                })}
                {data.storageBreakdown.length === 0 && (
                  <p className="text-sm text-muted-foreground">No storage data</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Generation Modes */}
          <Card>
            <CardHeader>
              <CardTitle>Generation Modes</CardTitle>
              <CardDescription>Photo generation styles used</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {data.generationModes.map((mode) => (
                  <div key={mode.mode} className="flex items-center gap-2">
                    <Badge variant="outline">{mode.mode}</Badge>
                    <span className="text-sm text-muted-foreground">{mode.count} photos</span>
                  </div>
                ))}
                {data.generationModes.length === 0 && (
                  <p className="text-sm text-muted-foreground">No generation data</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Models */}
          <Card>
            <CardHeader>
              <CardTitle>AI Models</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Photos</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.models.map((model) => (
                    <TableRow key={model.id}>
                      <TableCell className="font-medium">{model.name}</TableCell>
                      <TableCell className="capitalize">{model.type}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(model.status)}>
                          {model.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{model._count.photos}</TableCell>
                      <TableCell>{formatBytes(BigInt(model.total_size_bytes))}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(model.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {user.models.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No AI models created
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos">
          <Card>
            <CardHeader>
              <CardTitle>Recent Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {data.recentPhotos.map((photo) => (
                  <Link
                    key={photo.id}
                    href={`/billing/gallery/${photo.id}`}
                    className="group relative aspect-square rounded-lg overflow-hidden bg-muted"
                  >
                    <Image
                      src={photo.url}
                      alt="Generated photo"
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16vw"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                      <p className="text-xs text-white">
                        {photo.width}x{photo.height}
                      </p>
                      <p className="text-xs text-white/70">
                        {photo.credits_used} credits
                      </p>
                      <p className="text-xs text-white/50">{timeAgo(photo.created_at)}</p>
                    </div>
                  </Link>
                ))}
              </div>
              {data.recentPhotos.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No photos generated</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Login Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Login Time</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentSessions.map((session) => {
                    const expired = new Date(session.expiresAt) < new Date()
                    let device = "Unknown"
                    if (session.userAgent) {
                      if (session.userAgent.includes("Chrome")) device = "Chrome"
                      else if (session.userAgent.includes("Safari")) device = "Safari"
                      else if (session.userAgent.includes("Firefox")) device = "Firefox"
                    }
                    return (
                      <TableRow key={session.id}>
                        <TableCell>{formatDateTime(session.createdAt)}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {session.ipAddress || "N/A"}
                        </TableCell>
                        <TableCell>{device}</TableCell>
                        <TableCell>
                          <Badge variant={expired ? "secondary" : "success"}>
                            {expired ? "Expired" : "Active"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {data.recentSessions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No sessions recorded
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credits">
          <Card>
            <CardHeader>
              <CardTitle>Credit Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.creditTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-muted-foreground">
                        {formatDateTime(tx.created_at)}
                      </TableCell>
                      <TableCell className="capitalize">{tx.type}</TableCell>
                      <TableCell>{tx.description}</TableCell>
                      <TableCell className={`text-right ${tx.amount >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {tx.amount >= 0 ? "+" : ""}
                        {tx.amount}
                      </TableCell>
                      <TableCell className="text-right">{tx.balance_after}</TableCell>
                    </TableRow>
                  ))}
                  {data.creditTransactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No credit transactions
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Subscription History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Started</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Billing</TableHead>
                    <TableHead>Ended</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.subscriptionHistory.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="text-muted-foreground">
                        {formatDate(sub.started_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getTierColor(sub.tier)}>{sub.tier}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(sub.status)}>
                          {sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">
                        {sub.billing_interval || "N/A"}
                      </TableCell>
                      <TableCell>
                        {sub.ended_at ? (
                          <span className="text-muted-foreground">{formatDate(sub.ended_at)}</span>
                        ) : (
                          <Badge variant="success">Current</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {data.subscriptionHistory.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No subscription history
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

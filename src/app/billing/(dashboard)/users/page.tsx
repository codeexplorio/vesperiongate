"use client"

import { Suspense, useEffect, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { formatBytes, formatNumber, formatDate, getTierColor, getStatusColor } from "@/lib/utils"

interface User {
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
  }
}

interface UsersResponse {
  users: User[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

function UsersContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [data, setData] = useState<UsersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [tier, setTier] = useState(searchParams.get("tier") || "all")
  const [status, setStatus] = useState(searchParams.get("status") || "all")
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"))
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "createdAt")
  const [sortOrder, setSortOrder] = useState(searchParams.get("sortOrder") || "desc")

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        search,
        tier,
        status,
        sortBy,
        sortOrder,
      })
      const res = await fetch(`/api/billing/users?${params}`)
      if (!res.ok) throw new Error("Failed to fetch users")
      const result = await res.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [page, search, tier, status, sortBy, sortOrder])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (tier !== "all") params.set("tier", tier)
    if (status !== "all") params.set("status", status)
    if (page > 1) params.set("page", page.toString())
    if (sortBy !== "createdAt") params.set("sortBy", sortBy)
    if (sortOrder !== "desc") params.set("sortOrder", sortOrder)

    const queryString = params.toString()
    router.replace(`/billing/users${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    })
  }, [search, tier, status, page, sortBy, sortOrder, router])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">
          Manage and view all LensCherry users
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-10"
              />
            </div>

            <Select
              value={tier}
              onValueChange={(value) => {
                setTier(value)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Tiers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="none">No Tier</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="ultra">Ultra</SelectItem>
                <SelectItem value="comped">Comped</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="past_due">Past Due</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={`${sortBy}-${sortOrder}`}
              onValueChange={(value) => {
                const [by, order] = value.split("-")
                setSortBy(by)
                setSortOrder(order)
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">Newest First</SelectItem>
                <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                <SelectItem value="storage_used_bytes-desc">Most Storage</SelectItem>
                <SelectItem value="credits-desc">Most Credits</SelectItem>
                <SelectItem value="name-asc">Name A-Z</SelectItem>
              </SelectContent>
            </Select>

            {data && (
              <span className="text-sm text-muted-foreground ml-auto">
                {formatNumber(data.pagination.total)} users found
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-6 text-center text-destructive">{error}</div>
          ) : data ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Storage</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.users.map((user) => {
                    const used = BigInt(user.storage_used_bytes)
                    const limit = BigInt(user.storage_limit_bytes)
                    const percent = limit > 0 ? Number((used * 100n) / limit) : 0

                    return (
                      <TableRow
                        key={user.id}
                        className="cursor-pointer"
                        onClick={() => router.push(`/billing/users/${user.id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              {user.image && <AvatarImage src={user.image} alt={user.name} />}
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
                          <Badge
                            variant="outline"
                            className={getTierColor(user.subscription_tier || "none")}
                          >
                            {user.subscription_tier || "None"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getStatusColor(user.subscription_status)}
                          >
                            {user.subscription_status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{user._count.photos} photos</p>
                            <p className="text-muted-foreground">
                              {user._count.models} models
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p>{formatBytes(used)}</p>
                            <p className="text-sm text-muted-foreground">
                              {percent.toFixed(0)}% of {formatBytes(limit)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{formatNumber(user.credits)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(user.createdAt)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t">
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

export default function UsersPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div>
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-5 w-64 mt-2" />
          </div>
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      }
    >
      <UsersContent />
    </Suspense>
  )
}

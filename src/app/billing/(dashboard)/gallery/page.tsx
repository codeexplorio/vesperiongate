"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight, Camera, Zap, Clock } from "lucide-react"
import { formatNumber, timeAgo } from "@/lib/utils"

interface Photo {
  id: string
  url: string
  thumbnailUrl: string
  width: number
  height: number
  prompt: string
  negativePrompt: string | null
  seed: string | null
  creditsUsed: number
  generationTimeMs: number | null
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
  model: {
    id: string
    name: string
    type: string
  } | null
}

interface GalleryResponse {
  photos: Photo[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  stats: {
    totalPhotos: number
    totalCreditsUsed: number
    avgGenerationTimeMs: number
  }
}

export default function GalleryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [data, setData] = useState<GalleryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"))
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "created_at")
  const [sortOrder, setSortOrder] = useState(searchParams.get("sortOrder") || "desc")

  const fetchGallery = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "48",
        sortBy,
        sortOrder,
      })
      const res = await fetch(`/api/billing/gallery?${params}`)
      if (!res.ok) throw new Error("Failed to fetch gallery")
      const result = await res.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [page, sortBy, sortOrder])

  useEffect(() => {
    fetchGallery()
  }, [fetchGallery])

  useEffect(() => {
    const params = new URLSearchParams()
    if (page > 1) params.set("page", page.toString())
    if (sortBy !== "created_at") params.set("sortBy", sortBy)
    if (sortOrder !== "desc") params.set("sortOrder", sortOrder)

    const queryString = params.toString()
    router.replace(`/billing/gallery${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    })
  }, [page, sortBy, sortOrder, router])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gallery</h1>
          <p className="text-muted-foreground">
            Browse all generated photos across users
          </p>
        </div>
      </div>

      {/* Stats */}
      {data && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Photos</CardTitle>
              <Camera className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(data.stats.totalPhotos)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits Used</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(data.stats.totalCreditsUsed)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Generation Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(data.stats.avgGenerationTimeMs / 1000).toFixed(1)}s
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <Select
              value={`${sortBy}-${sortOrder}`}
              onValueChange={(value) => {
                const [by, order] = value.split("-")
                setSortBy(by)
                setSortOrder(order)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at-desc">Newest First</SelectItem>
                <SelectItem value="created_at-asc">Oldest First</SelectItem>
                <SelectItem value="credits_used-desc">Most Credits</SelectItem>
                <SelectItem value="generation_time_ms-desc">Longest Generation</SelectItem>
              </SelectContent>
            </Select>

            {data && (
              <span className="text-sm text-muted-foreground ml-auto">
                Showing {(page - 1) * 48 + 1} - {Math.min(page * 48, data.pagination.total)} of{" "}
                {formatNumber(data.pagination.total)} photos
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Gallery Grid */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {Array.from({ length: 48 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center text-destructive py-8">{error}</div>
          ) : data ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {data.photos.map((photo) => (
                  <Link
                    key={photo.id}
                    href={`/billing/gallery/${photo.id}`}
                    className="group relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer"
                  >
                    <Image
                      src={photo.thumbnailUrl}
                      alt="Generated photo"
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, (max-width: 1280px) 16vw, 12vw"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                      <p className="text-xs text-white truncate">{photo.user.name}</p>
                      <p className="text-xs text-white/70">{timeAgo(photo.createdAt)}</p>
                    </div>
                  </Link>
                ))}
              </div>

              {data.photos.length === 0 && (
                <p className="text-center text-muted-foreground py-12">
                  No photos found
                </p>
              )}

              {/* Pagination */}
              {data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t">
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

"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  Sparkles,
  Calendar,
  Image as ImageIcon,
  Clock,
  User,
  Boxes,
} from "lucide-react"
import { formatDateTime, timeAgo } from "@/lib/utils"

interface PhotoDetail {
  photo: {
    id: string
    url: string
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
      image: string | null
    }
    model: {
      id: string
      name: string
      type: string
    } | null
  }
  previousPhotoId: string | null
  nextPhotoId: string | null
}

export default function PhotoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const photoId = params.id as string

  const [data, setData] = useState<PhotoDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageLoading, setImageLoading] = useState(true)

  useEffect(() => {
    async function fetchPhoto() {
      setLoading(true)
      setImageLoading(true)
      try {
        const res = await fetch(`/api/billing/gallery/${photoId}`)
        if (!res.ok) {
          if (res.status === 404) throw new Error("Photo not found")
          throw new Error("Failed to fetch photo")
        }
        const result = await res.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }
    fetchPhoto()
  }, [photoId])

  const handleDownload = async () => {
    if (!data?.photo.url) return

    try {
      const response = await fetch(data.photo.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `photo-${data.photo.id}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Failed to download:", error)
    }
  }

  const formatGenerationTime = (ms: number | null) => {
    if (!ms) return "Unknown"
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="aspect-square w-full rounded-lg" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] gap-4">
        <p className="text-destructive">{error || "Failed to load photo"}</p>
        <Button variant="outline" onClick={() => router.push("/billing/gallery")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Gallery
        </Button>
      </div>
    )
  }

  const { photo, previousPhotoId, nextPhotoId } = data

  return (
    <div className="space-y-6">
      {/* Top Actions Bar */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push("/billing/gallery")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Gallery
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => previousPhotoId && router.push(`/billing/gallery/${previousPhotoId}`)}
            disabled={!previousPhotoId}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => nextPhotoId && router.push(`/billing/gallery/${nextPhotoId}`)}
            disabled={!nextPhotoId}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Image Viewer */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden bg-muted/50">
            <CardContent className="p-6">
              <div className="relative w-full flex items-center justify-center">
                {imageLoading && (
                  <Skeleton className="absolute inset-0 w-full aspect-square" />
                )}
                <Image
                  src={photo.url}
                  alt={photo.prompt.slice(0, 100)}
                  width={photo.width}
                  height={photo.height}
                  className="w-full h-auto object-contain rounded-lg shadow-2xl"
                  onLoad={() => setImageLoading(false)}
                  priority
                />
              </div>
              <div className="mt-6 flex justify-center">
                <Button onClick={handleDownload} size="lg" className="gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Metadata */}
        <div className="space-y-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Created By
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  {photo.user.image && (
                    <AvatarImage src={photo.user.image} alt={photo.user.name} />
                  )}
                  <AvatarFallback>
                    {photo.user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{photo.user.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {photo.user.email}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full mt-4"
                asChild
              >
                <Link href={`/billing/users/${photo.user.id}`}>
                  View User Profile
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Prompt */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Prompt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{photo.prompt}</p>
            </CardContent>
          </Card>

          {/* Negative Prompt */}
          {photo.negativePrompt && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Negative Prompt</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {photo.negativePrompt}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Model Info */}
          {photo.model && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Boxes className="h-5 w-5" />
                  Model
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="font-medium">{photo.model.name}</span>
                  <Badge variant="outline" className="capitalize">
                    {photo.model.type}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Generation Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Generation Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {photo.seed && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Seed</span>
                  <Badge variant="secondary" className="font-mono">
                    {photo.seed}
                  </Badge>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Credits Used</span>
                <Badge variant="secondary">{photo.creditsUsed}</Badge>
              </div>
              {photo.generationTimeMs && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Generation Time
                  </span>
                  <Badge variant="secondary">
                    {formatGenerationTime(photo.generationTimeMs)}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* File Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                File Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Dimensions</span>
                <span className="text-sm font-medium">
                  {photo.width} x {photo.height}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Created
                </span>
                <span className="text-sm font-medium">
                  {timeAgo(photo.createdAt)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground text-right">
                {formatDateTime(photo.createdAt)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export const dynamic = 'force-dynamic'

// Initialize S3 client for Hetzner Object Storage (S3-compatible)
const s3Client = new S3Client({
  region: process.env.S3_REGION || 'eu-central-1',
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
})

const S3_BUCKET = process.env.S3_BUCKET || 'lenscherry-production'

/**
 * Generate a presigned URL for a private S3 object
 * Includes Hetzner Object Storage compatibility options
 */
async function generatePresignedUrl(key: string): Promise<string> {
  if (!key) return ''

  try {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    })

    let url = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
      // Don't sign checksum headers - Hetzner doesn't support them
      unsignableHeaders: new Set(['x-amz-checksum-mode']),
      unhoistableHeaders: new Set(['x-amz-checksum-mode']),
    })

    // Strip out checksum-mode parameter if present (Hetzner doesn't support it)
    if (url.includes('x-amz-checksum-mode')) {
      url = url.replace(/[&?]x-amz-checksum-mode=[^&]*/g, '')
    }

    return url
  } catch (error) {
    console.error(`Failed to generate presigned URL for key ${key}:`, error)
    return ''
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '48')
    const userId = searchParams.get('userId') || ''
    const modelId = searchParams.get('modelId') || ''
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'

    const where: Record<string, unknown> = {
      is_deleted: false,
    }

    if (userId) {
      where.user_id = userId
    }

    if (modelId) {
      where.model_id = modelId
    }

    const orderBy: Record<string, 'asc' | 'desc'> = {}
    orderBy[sortBy] = sortOrder

    const [photos, total] = await Promise.all([
      prisma.photo.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          url: true,
          s3_key: true,
          thumbnail_url: true,
          width: true,
          height: true,
          prompt: true,
          negative_prompt: true,
          seed: true,
          credits_used: true,
          generation_time_ms: true,
          created_at: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          model: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
      }),
      prisma.photo.count({ where }),
    ])

    // Generate presigned URLs for photos with s3_key
    const photosWithUrls = await Promise.all(
      photos.map(async (photo) => {
        let presignedUrl = photo.url

        // If we have an s3_key, generate a fresh presigned URL
        if (photo.s3_key) {
          presignedUrl = await generatePresignedUrl(photo.s3_key)
        }

        // Use the same URL for thumbnail - Next.js Image component handles resizing
        return {
          id: photo.id,
          url: presignedUrl,
          thumbnailUrl: presignedUrl,
          width: photo.width,
          height: photo.height,
          prompt: photo.prompt,
          negativePrompt: photo.negative_prompt,
          seed: photo.seed,
          creditsUsed: photo.credits_used,
          generationTimeMs: photo.generation_time_ms,
          createdAt: photo.created_at.toISOString(),
          user: photo.user,
          model: photo.model,
        }
      })
    )

    // Get aggregate stats
    const [totalPhotos, totalCreditsUsed, avgGenerationTime] = await Promise.all([
      prisma.photo.count({ where: { is_deleted: false } }),
      prisma.photo.aggregate({
        where: { is_deleted: false },
        _sum: { credits_used: true },
      }),
      prisma.photo.aggregate({
        where: { is_deleted: false, generation_time_ms: { not: null } },
        _avg: { generation_time_ms: true },
      }),
    ])

    return NextResponse.json({
      photos: photosWithUrls,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalPhotos,
        totalCreditsUsed: totalCreditsUsed._sum.credits_used || 0,
        avgGenerationTimeMs: Math.round(avgGenerationTime._avg.generation_time_ms || 0),
      },
    })
  } catch (error) {
    console.error('Gallery error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gallery' },
      { status: 500 }
    )
  }
}

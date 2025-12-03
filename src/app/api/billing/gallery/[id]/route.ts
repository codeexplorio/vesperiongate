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

async function generatePresignedUrl(key: string): Promise<string> {
  if (!key) return ''

  try {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    })

    let url = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
      unsignableHeaders: new Set(['x-amz-checksum-mode']),
      unhoistableHeaders: new Set(['x-amz-checksum-mode']),
    })

    if (url.includes('x-amz-checksum-mode')) {
      url = url.replace(/[&?]x-amz-checksum-mode=[^&]*/g, '')
    }

    return url
  } catch (error) {
    console.error(`Failed to generate presigned URL for key ${key}:`, error)
    return ''
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch the photo with user and model information
    const photo = await prisma.photo.findFirst({
      where: {
        id,
        is_deleted: false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
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
    })

    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    }

    // Generate presigned URL
    const presignedUrl = photo.s3_key
      ? await generatePresignedUrl(photo.s3_key)
      : photo.url

    // Get previous and next photo IDs for navigation
    const [previousPhoto, nextPhoto] = await Promise.all([
      prisma.photo.findFirst({
        where: {
          is_deleted: false,
          created_at: { gt: photo.created_at },
        },
        orderBy: { created_at: 'asc' },
        select: { id: true },
      }),
      prisma.photo.findFirst({
        where: {
          is_deleted: false,
          created_at: { lt: photo.created_at },
        },
        orderBy: { created_at: 'desc' },
        select: { id: true },
      }),
    ])

    return NextResponse.json({
      photo: {
        id: photo.id,
        url: presignedUrl,
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
      },
      previousPhotoId: previousPhoto?.id || null,
      nextPhotoId: nextPhoto?.id || null,
    })
  } catch (error) {
    console.error('Photo detail error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch photo details' },
      { status: 500 }
    )
  }
}

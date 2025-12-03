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
 */
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

    const [user, recentPhotos, recentSessions, creditTransactions, subscriptionHistory] = await Promise.all([
      prisma.user.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              photos: true,
              models: true,
              sessions: true,
              favorites: true,
              storage_items: true,
            },
          },
          models: {
            take: 10,
            orderBy: { created_at: 'desc' },
            select: {
              id: true,
              name: true,
              type: true,
              status: true,
              total_size_bytes: true,
              created_at: true,
              _count: { select: { photos: true } },
            },
          },
        },
      }),
      prisma.photo.findMany({
        where: { user_id: id, is_deleted: false },
        take: 24,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          url: true,
          s3_key: true,
          thumbnail_url: true,
          width: true,
          height: true,
          credits_used: true,
          generation_time_ms: true,
          created_at: true,
          prompt: true,
          model: { select: { id: true, name: true } },
        },
      }),
      prisma.session.findMany({
        where: { userId: id },
        take: 20,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          ipAddress: true,
          userAgent: true,
          createdAt: true,
          expiresAt: true,
        },
      }),
      prisma.credit_transaction.findMany({
        where: { user_id: id },
        take: 50,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          amount: true,
          balance_after: true,
          type: true,
          description: true,
          created_at: true,
        },
      }),
      prisma.subscription_history.findMany({
        where: { user_id: id },
        orderBy: { started_at: 'desc' },
        select: {
          id: true,
          tier: true,
          status: true,
          billing_interval: true,
          started_at: true,
          ended_at: true,
        },
      }),
    ])

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate storage breakdown
    const storageBreakdown = await prisma.storage_item.groupBy({
      by: ['item_type'],
      where: { user_id: id },
      _sum: { file_size_bytes: true },
      _count: { id: true },
    })

    // Photos by day (last 30 days)
    const photosActivity = await prisma.$queryRaw`
      SELECT DATE(created_at) as date, COUNT(*)::int as count
      FROM photo
      WHERE user_id = ${id}
        AND created_at >= ${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
        AND is_deleted = false
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    ` as Array<{ date: Date; count: number }>

    // Get generation mode stats
    const generationModes = await prisma.$queryRaw`
      SELECT
        COALESCE(
          CASE
            WHEN prompt LIKE '%realistic%' OR prompt LIKE '%photo%' THEN 'Realistic'
            WHEN prompt LIKE '%anime%' OR prompt LIKE '%cartoon%' THEN 'Anime'
            WHEN prompt LIKE '%artistic%' OR prompt LIKE '%painting%' THEN 'Artistic'
            ELSE 'Standard'
          END,
          'Standard'
        ) as mode,
        COUNT(*)::int as count
      FROM photo
      WHERE user_id = ${id} AND is_deleted = false
      GROUP BY mode
      ORDER BY count DESC
    ` as Array<{ mode: string; count: number }>

    // Get reference images count per model
    const referenceImagesCount = await prisma.model_reference_image.count({
      where: {
        model: {
          user_id: id,
        },
      },
    })

    // Generate presigned URLs for photos
    const photosWithUrls = await Promise.all(
      recentPhotos.map(async (photo) => {
        let presignedUrl = photo.url

        if (photo.s3_key) {
          presignedUrl = await generatePresignedUrl(photo.s3_key)
        }

        return {
          id: photo.id,
          url: presignedUrl,
          width: photo.width,
          height: photo.height,
          credits_used: photo.credits_used,
          generation_time_ms: photo.generation_time_ms,
          created_at: photo.created_at.toISOString(),
          prompt: photo.prompt,
          model: photo.model,
        }
      })
    )

    return NextResponse.json({
      user: {
        ...user,
        storage_used_bytes: user.storage_used_bytes.toString(),
        storage_limit_bytes: user.storage_limit_bytes.toString(),
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        models: user.models.map(m => ({
          ...m,
          total_size_bytes: m.total_size_bytes?.toString() || '0',
          created_at: m.created_at.toISOString(),
        })),
      },
      recentPhotos: photosWithUrls,
      recentSessions: recentSessions.map(s => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
        expiresAt: s.expiresAt.toISOString(),
      })),
      creditTransactions: creditTransactions.map(t => ({
        ...t,
        created_at: t.created_at.toISOString(),
      })),
      subscriptionHistory: subscriptionHistory.map(s => ({
        ...s,
        started_at: s.started_at.toISOString(),
        ended_at: s.ended_at?.toISOString() || null,
      })),
      storageBreakdown: storageBreakdown.map(s => ({
        type: s.item_type,
        bytes: s._sum.file_size_bytes?.toString() || '0',
        count: s._count.id,
      })),
      photosActivity: photosActivity.map(p => ({
        date: p.date.toISOString().split('T')[0],
        count: p.count,
      })),
      generationModes,
      referenceImagesCount,
    })
  } catch (error) {
    console.error('User detail error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user details' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'

    // Overall storage stats
    const [
      totalStorage,
      storageByType,
      storageByTier,
      topStorageUsers,
      storageGrowth,
      imageSizeDistribution,
    ] = await Promise.all([
      prisma.user.aggregate({
        _sum: { storage_used_bytes: true },
        _avg: { storage_used_bytes: true },
        _max: { storage_used_bytes: true },
      }),
      prisma.storage_item.groupBy({
        by: ['item_type'],
        _sum: { file_size_bytes: true },
        _count: { id: true },
        _avg: { file_size_bytes: true },
      }),
      prisma.user.groupBy({
        by: ['subscription_tier'],
        _sum: { storage_used_bytes: true },
        _count: { id: true },
        _avg: { storage_used_bytes: true },
      }),
      prisma.user.findMany({
        where: { storage_used_bytes: { gt: 0 } },
        orderBy: { storage_used_bytes: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          subscription_tier: true,
          storage_used_bytes: true,
          storage_limit_bytes: true,
          _count: { select: { photos: true, models: true, storage_items: true } },
        },
      }),
      prisma.$queryRaw`
        SELECT
          DATE(created_at) as date,
          SUM(file_size_bytes)::bigint as total_bytes,
          COUNT(*)::int as items_count
        FROM storage_item
        WHERE created_at >= ${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      ` as Promise<Array<{ date: Date; total_bytes: bigint; items_count: number }>>,
      prisma.$queryRaw`
        SELECT
          CASE
            WHEN file_size_bytes < 102400 THEN 'tiny (<100KB)'
            WHEN file_size_bytes < 524288 THEN 'small (100KB-512KB)'
            WHEN file_size_bytes < 1048576 THEN 'medium (512KB-1MB)'
            WHEN file_size_bytes < 5242880 THEN 'large (1-5MB)'
            ELSE 'very_large (>5MB)'
          END as size_category,
          COUNT(*)::int as count,
          SUM(file_size_bytes)::bigint as total_bytes
        FROM storage_item
        GROUP BY
          CASE
            WHEN file_size_bytes < 102400 THEN 'tiny (<100KB)'
            WHEN file_size_bytes < 524288 THEN 'small (100KB-512KB)'
            WHEN file_size_bytes < 1048576 THEN 'medium (512KB-1MB)'
            WHEN file_size_bytes < 5242880 THEN 'large (1-5MB)'
            ELSE 'very_large (>5MB)'
          END
        ORDER BY total_bytes DESC
      ` as Promise<Array<{ size_category: string; count: number; total_bytes: bigint }>>,
    ])

    const totalUsers = await prisma.user.count({ where: { storage_used_bytes: { gt: 0 } } })

    return NextResponse.json({
      overview: {
        totalStorage: totalStorage._sum.storage_used_bytes?.toString() || '0',
        avgStoragePerUser: totalStorage._avg.storage_used_bytes?.toString() || '0',
        maxStorageUser: totalStorage._max.storage_used_bytes?.toString() || '0',
      },
      byType: storageByType.map(s => ({
        type: s.item_type,
        totalBytes: s._sum.file_size_bytes?.toString() || '0',
        count: s._count.id,
        avgBytes: s._avg.file_size_bytes?.toString() || '0',
      })),
      byTier: storageByTier.map(t => ({
        tier: t.subscription_tier || 'none',
        totalBytes: t._sum.storage_used_bytes?.toString() || '0',
        userCount: t._count.id,
        avgBytes: t._avg.storage_used_bytes?.toString() || '0',
      })),
      topUsers: topStorageUsers.map(u => ({
        ...u,
        storage_used_bytes: u.storage_used_bytes.toString(),
        storage_limit_bytes: u.storage_limit_bytes.toString(),
        usagePercent: Number(u.storage_used_bytes) / Number(u.storage_limit_bytes) * 100,
      })),
      growth: storageGrowth.map(g => ({
        date: g.date.toISOString().split('T')[0],
        totalBytes: g.total_bytes.toString(),
        itemsCount: g.items_count,
      })),
      sizeDistribution: imageSizeDistribution.map(s => ({
        category: s.size_category,
        count: s.count,
        totalBytes: s.total_bytes.toString(),
      })),
      pagination: {
        page,
        limit,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
      },
    })
  } catch (error) {
    console.error('Storage error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch storage data' },
      { status: 500 }
    )
  }
}

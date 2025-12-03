import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    // Parallel queries for better performance
    const [
      totalUsers,
      usersToday,
      usersThisWeek,
      usersThisMonth,
      usersLastMonth,
      activeSubscriptions,
      totalPhotos,
      photosToday,
      photosThisWeek,
      totalModels,
      totalVideos,
      totalCreditsUsed,
      totalStorage,
      activeSessions,
      tierDistribution,
      statusDistribution,
      recentSignups,
      recentSessions,
      topUsers,
      storageByType,
      photosPerDay,
      signupsPerDay,
    ] = await Promise.all([
      // User counts
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.user.count({ where: { createdAt: { gte: thisWeek } } }),
      prisma.user.count({ where: { createdAt: { gte: thisMonth } } }),
      prisma.user.count({ where: { createdAt: { gte: lastMonth, lt: thisMonth } } }),

      // Active subscriptions
      prisma.user.count({ where: { subscription_status: 'active' } }),

      // Content counts
      prisma.photo.count({ where: { is_deleted: false } }),
      prisma.photo.count({ where: { is_deleted: false, created_at: { gte: today } } }),
      prisma.photo.count({ where: { is_deleted: false, created_at: { gte: thisWeek } } }),
      prisma.ai_model.count({ where: { is_archived: false } }),
      prisma.video.count(),

      // Credits used (sum from credit transactions)
      prisma.credit_transaction.aggregate({
        _sum: { amount: true },
        where: { amount: { lt: 0 } },
      }),

      // Storage
      prisma.user.aggregate({ _sum: { storage_used_bytes: true } }),

      // Active sessions (not expired)
      prisma.session.count({ where: { expiresAt: { gt: now } } }),

      // Subscription tier distribution
      prisma.user.groupBy({
        by: ['subscription_tier'],
        _count: { id: true },
      }),

      // Subscription status distribution
      prisma.user.groupBy({
        by: ['subscription_status'],
        _count: { id: true },
      }),

      // Recent signups (last 10)
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          subscription_tier: true,
          subscription_status: true,
          createdAt: true,
          _count: { select: { photos: true, models: true } },
        },
      }),

      // Recent sessions (last 20)
      prisma.session.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),

      // Top users by photos
      prisma.user.findMany({
        take: 10,
        orderBy: { storage_used_bytes: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          subscription_tier: true,
          storage_used_bytes: true,
          credits: true,
          _count: { select: { photos: true, models: true } },
        },
      }),

      // Storage by item type
      prisma.storage_item.groupBy({
        by: ['item_type'],
        _sum: { file_size_bytes: true },
        _count: { id: true },
      }),

      // Photos per day (last 30 days)
      prisma.$queryRaw`
        SELECT DATE(created_at) as date, COUNT(*)::int as count
        FROM photo
        WHERE created_at >= ${new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)}
          AND is_deleted = false
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      ` as Promise<Array<{ date: Date; count: number }>>,

      // Signups per day (last 30 days)
      prisma.$queryRaw`
        SELECT DATE(created_at) as date, COUNT(*)::int as count
        FROM "user"
        WHERE created_at >= ${new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)}
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      ` as Promise<Array<{ date: Date; count: number }>>,
    ])

    // Calculate growth rate
    const userGrowthRate = usersLastMonth > 0
      ? ((usersThisMonth - usersLastMonth) / usersLastMonth * 100).toFixed(1)
      : '100'

    return NextResponse.json({
      overview: {
        totalUsers,
        usersToday,
        usersThisWeek,
        usersThisMonth,
        userGrowthRate: parseFloat(userGrowthRate),
        activeSubscriptions,
        totalPhotos,
        photosToday,
        photosThisWeek,
        totalModels,
        totalVideos,
        totalCreditsUsed: Math.abs(totalCreditsUsed._sum.amount || 0),
        totalStorage: totalStorage._sum.storage_used_bytes?.toString() || '0',
        activeSessions,
      },
      distributions: {
        tiers: tierDistribution.map(t => ({
          tier: t.subscription_tier || 'none',
          count: t._count.id,
        })),
        statuses: statusDistribution.map(s => ({
          status: s.subscription_status,
          count: s._count.id,
        })),
        storageByType: storageByType.map(s => ({
          type: s.item_type,
          bytes: s._sum.file_size_bytes?.toString() || '0',
          count: s._count.id,
        })),
      },
      activity: {
        recentSignups: recentSignups.map(u => ({
          ...u,
          createdAt: u.createdAt.toISOString(),
        })),
        recentSessions: recentSessions.map(s => ({
          id: s.id,
          userId: s.userId,
          userName: s.user.name,
          userEmail: s.user.email,
          ipAddress: s.ipAddress,
          userAgent: s.userAgent,
          createdAt: s.createdAt.toISOString(),
          expiresAt: s.expiresAt.toISOString(),
        })),
      },
      topUsers: topUsers.map(u => ({
        ...u,
        storage_used_bytes: u.storage_used_bytes.toString(),
      })),
      charts: {
        photosPerDay: photosPerDay.map(p => ({
          date: p.date.toISOString().split('T')[0],
          count: p.count,
        })),
        signupsPerDay: signupsPerDay.map(s => ({
          date: s.date.toISOString().split('T')[0],
          count: s.count,
        })),
      },
    })
  } catch (error) {
    console.error('Billing stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}

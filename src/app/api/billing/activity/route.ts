import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const now = new Date()
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [
      sessionsToday,
      sessionsWeek,
      uniqueUsersToday,
      uniqueUsersWeek,
      photosToday,
      photosWeek,
      signupsToday,
      signupsWeek,
      recentSessions,
      recentPhotos,
      recentSignups,
      hourlyActivity,
    ] = await Promise.all([
      prisma.session.count({ where: { createdAt: { gte: last24h } } }),
      prisma.session.count({ where: { createdAt: { gte: last7d } } }),
      prisma.session.findMany({
        where: { createdAt: { gte: last24h } },
        distinct: ['userId'],
        select: { userId: true },
      }).then(s => s.length),
      prisma.session.findMany({
        where: { createdAt: { gte: last7d } },
        distinct: ['userId'],
        select: { userId: true },
      }).then(s => s.length),
      prisma.photo.count({ where: { created_at: { gte: last24h }, is_deleted: false } }),
      prisma.photo.count({ where: { created_at: { gte: last7d }, is_deleted: false } }),
      prisma.user.count({ where: { createdAt: { gte: last24h } } }),
      prisma.user.count({ where: { createdAt: { gte: last7d } } }),
      prisma.session.findMany({
        take: 30,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true, subscription_tier: true } },
        },
      }),
      prisma.photo.findMany({
        where: { is_deleted: false },
        take: 30,
        orderBy: { created_at: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          model: { select: { id: true, name: true } },
        },
      }),
      prisma.user.findMany({
        take: 30,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          subscription_tier: true,
          createdAt: true,
        },
      }),
      prisma.$queryRaw`
        SELECT
          EXTRACT(HOUR FROM created_at) as hour,
          COUNT(*)::int as sessions
        FROM session
        WHERE created_at >= ${last24h}
        GROUP BY EXTRACT(HOUR FROM created_at)
        ORDER BY hour
      ` as Promise<Array<{ hour: number; sessions: number }>>,
    ])

    return NextResponse.json({
      summary: {
        sessionsToday,
        sessionsWeek,
        uniqueUsersToday,
        uniqueUsersWeek,
        photosToday,
        photosWeek,
        signupsToday,
        signupsWeek,
      },
      recentSessions: recentSessions.map(s => ({
        id: s.id,
        type: 'session',
        userId: s.userId,
        userName: s.user.name,
        userEmail: s.user.email,
        userTier: s.user.subscription_tier,
        ipAddress: s.ipAddress,
        userAgent: s.userAgent,
        createdAt: s.createdAt.toISOString(),
        expiresAt: s.expiresAt.toISOString(),
        isActive: s.expiresAt > now,
      })),
      recentPhotos: recentPhotos.map(p => ({
        id: p.id,
        type: 'photo',
        userId: p.user_id,
        userName: p.user.name,
        userEmail: p.user.email,
        modelName: p.model?.name || null,
        creditsUsed: p.credits_used,
        createdAt: p.created_at.toISOString(),
      })),
      recentSignups: recentSignups.map(u => ({
        id: u.id,
        type: 'signup',
        userName: u.name,
        userEmail: u.email,
        tier: u.subscription_tier,
        createdAt: u.createdAt.toISOString(),
      })),
      hourlyActivity: hourlyActivity.map(h => ({
        hour: h.hour,
        sessions: h.sessions,
      })),
    })
  } catch (error) {
    console.error('Activity error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    )
  }
}

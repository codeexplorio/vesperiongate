import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const tier = searchParams.get('tier') || ''
    const status = searchParams.get('status') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (tier && tier !== 'all') {
      where.subscription_tier = tier === 'none' ? null : tier
    }

    if (status && status !== 'all') {
      where.subscription_status = status
    }

    const orderBy: Record<string, 'asc' | 'desc'> = {}
    orderBy[sortBy] = sortOrder

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          subscription_tier: true,
          subscription_status: true,
          is_comped: true,
          credits: true,
          models_limit: true,
          storage_used_bytes: true,
          storage_limit_bytes: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              photos: true,
              models: true,
              sessions: true,
              favorites: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      users: users.map(u => ({
        ...u,
        storage_used_bytes: u.storage_used_bytes.toString(),
        storage_limit_bytes: u.storage_limit_bytes.toString(),
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Users list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

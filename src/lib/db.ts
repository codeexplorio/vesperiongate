import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: Pool | undefined
  isShuttingDown: boolean
}

// Initialize shutdown flag
globalForPrisma.isShuttingDown = globalForPrisma.isShuttingDown ?? false

function createPrismaClient() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  })

  // Store pool reference for shutdown
  globalForPrisma.pool = pool

  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// Always cache in production to prevent connection leaks
globalForPrisma.prisma = prisma

// Graceful shutdown handler
async function shutdown(signal: string) {
  if (globalForPrisma.isShuttingDown) return
  globalForPrisma.isShuttingDown = true

  console.log(`[Prisma] Received ${signal}, shutting down gracefully...`)

  try {
    await prisma.$disconnect()
    if (globalForPrisma.pool) {
      await globalForPrisma.pool.end()
    }
    console.log('[Prisma] Disconnected successfully')
  } catch (error) {
    console.error('[Prisma] Error during shutdown:', error)
  }
}

// Setup shutdown handlers (only once)
if (typeof process !== 'undefined' && !globalForPrisma.isShuttingDown) {
  process.once('SIGINT', () => shutdown('SIGINT'))
  process.once('SIGTERM', () => shutdown('SIGTERM'))
  process.once('beforeExit', () => shutdown('beforeExit'))
}

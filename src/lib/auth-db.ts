import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/auth-prisma/client'

const connectionString = process.env.AUTH_DATABASE_URL!

const globalForAuthPrisma = globalThis as unknown as {
  authPrisma: PrismaClient | undefined
  isAuthShuttingDown: boolean
}

// Initialize shutdown flag
globalForAuthPrisma.isAuthShuttingDown = globalForAuthPrisma.isAuthShuttingDown ?? false

function createAuthPrismaClient() {
  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({ adapter })
}

export const authPrisma = globalForAuthPrisma.authPrisma ?? createAuthPrismaClient()

// Always cache in production to prevent connection leaks
globalForAuthPrisma.authPrisma = authPrisma

// Graceful shutdown handler for auth database
async function shutdownAuth(signal: string) {
  if (globalForAuthPrisma.isAuthShuttingDown) return
  globalForAuthPrisma.isAuthShuttingDown = true

  console.log(`[AuthPrisma] Received ${signal}, shutting down gracefully...`)

  try {
    await authPrisma.$disconnect()
    console.log('[AuthPrisma] Disconnected successfully')
  } catch (error) {
    console.error('[AuthPrisma] Error during shutdown:', error)
  }
}

// Setup shutdown handlers (only once)
if (typeof process !== 'undefined' && !globalForAuthPrisma.isAuthShuttingDown) {
  process.once('SIGINT', () => shutdownAuth('SIGINT'))
  process.once('SIGTERM', () => shutdownAuth('SIGTERM'))
  process.once('beforeExit', () => shutdownAuth('beforeExit'))
}

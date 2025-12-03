import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/auth-prisma/client'

const connectionString = process.env.AUTH_DATABASE_URL!

const globalForAuthPrisma = globalThis as unknown as {
  authPrisma: PrismaClient | undefined
}

function createAuthPrismaClient() {
  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({ adapter })
}

export const authPrisma = globalForAuthPrisma.authPrisma ?? createAuthPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForAuthPrisma.authPrisma = authPrisma
}

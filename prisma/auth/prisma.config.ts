import path from 'node:path'
import dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '../../.env') })

const config = {
  schema: path.join(__dirname, 'schema.prisma'),
  datasource: {
    url: process.env.AUTH_DATABASE_URL,
  },
}

export default config

import 'dotenv/config'
import { Pool } from 'pg'
import { hashPassword, generateRandomString } from 'better-auth/crypto'

const EMAIL = 'jasonhanschell@icloud.com'
const NAME = 'Jason Hanschell'
const TEMP_PASSWORD = 'VesperionGate2024!' // Temporary password - user should change on first login

async function main() {
  const pool = new Pool({
    connectionString: process.env.AUTH_DATABASE_URL,
  })

  try {
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM "user" WHERE email = $1',
      [EMAIL]
    )

    if (existingUser.rows.length > 0) {
      console.log(`User ${EMAIL} already exists`)
      return
    }

    // Hash the password using Better Auth's crypto
    const hashedPassword = await hashPassword(TEMP_PASSWORD)

    // Generate IDs
    const userId = generateRandomString(21, 'a-z', '0-9')
    const accountId = generateRandomString(21, 'a-z', '0-9')

    // Create the user
    await pool.query(
      `INSERT INTO "user" (id, email, name, "emailVerified", role, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [userId, EMAIL, NAME, true, 'admin']
    )

    // Create the credential account
    await pool.query(
      `INSERT INTO "account" (id, "userId", "accountId", "providerId", password, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [accountId, userId, userId, 'credential', hashedPassword]
    )

    console.log(`Admin user created successfully:`)
    console.log(`  Email: ${EMAIL}`)
    console.log(`  Password: ${TEMP_PASSWORD}`)
    console.log(`\nPlease change the password after first login!`)
  } catch (error) {
    console.error('Error creating admin user:', error)
    throw error
  } finally {
    await pool.end()
  }
}

main().catch(console.error)

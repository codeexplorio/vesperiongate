import crypto from 'crypto'

const SESSION_SECRET = process.env.SESSION_SECRET || 'vesperion-session-secret-change-me'

export function verifySessionToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const parts = decoded.split(':')

    if (parts.length !== 3) return false

    const [user, expiresStr, signature] = parts
    const expires = parseInt(expiresStr, 10)

    // Check if expired
    if (Date.now() > expires) return false

    // Verify signature
    const data = `${user}:${expiresStr}`
    const hmac = crypto.createHmac('sha256', SESSION_SECRET)
    hmac.update(data)
    const expectedSignature = hmac.digest('hex')

    // Constant-time comparison
    if (signature.length !== expectedSignature.length) return false

    const sigBuffer = Buffer.from(signature)
    const expectedBuffer = Buffer.from(expectedSignature)

    return crypto.timingSafeEqual(sigBuffer, expectedBuffer)
  } catch {
    return false
  }
}

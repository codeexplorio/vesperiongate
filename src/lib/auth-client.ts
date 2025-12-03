import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'https://vesperiongate.com',
})

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  getSession,
  requestPasswordReset,
  resetPassword,
  sendVerificationEmail,
} = authClient

// Alias forgetPassword to requestPasswordReset for convenience
export const forgetPassword = requestPasswordReset

// Verify email wrapper
export const verifyEmail = async (options: { query: { token: string } }) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://vesperiongate.com'}/api/auth/verify-email?token=${options.query.token}`, {
    method: 'GET',
    credentials: 'include',
  })
  const data = await response.json()
  if (!response.ok) {
    return { error: { message: data.message || 'Failed to verify email' } }
  }
  return { data }
}

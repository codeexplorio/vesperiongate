import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'
import { authPrisma } from './auth-db'
import { resend, FROM_EMAIL } from './resend'

export const auth = betterAuth({
  database: prismaAdapter(authPrisma, {
    provider: 'postgresql',
  }),
  plugins: [nextCookies()], // Must be last plugin
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: user.email,
          subject: 'Reset your VesperionGate password',
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 40px 20px; margin: 0;">
                <div style="max-width: 480px; margin: 0 auto; background-color: #171717; border-radius: 12px; padding: 32px; border: 1px solid #262626;">
                  <h1 style="color: #a78bfa; margin: 0 0 24px 0; font-size: 24px; font-weight: 600;">VesperionGate</h1>
                  <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 500;">Reset Your Password</h2>
                  <p style="color: #a1a1aa; margin: 0 0 24px 0; line-height: 1.6;">
                    Hi ${user.name || 'there'},<br><br>
                    We received a request to reset your password. Click the button below to create a new password.
                  </p>
                  <a href="${url}" style="display: inline-block; background-color: #7c3aed; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 500; margin-bottom: 24px;">
                    Reset Password
                  </a>
                  <p style="color: #71717a; font-size: 14px; margin: 24px 0 0 0; line-height: 1.5;">
                    Or copy this link:<br>
                    <span style="color: #a78bfa; word-break: break-all;">${url}</span>
                  </p>
                  <p style="color: #dc2626; font-size: 12px; margin: 24px 0 0 0;">
                    This link expires in 1 hour. If you didn't request this, please ignore this email.
                  </p>
                </div>
              </body>
            </html>
          `,
        })
      } catch (error) {
        console.error('Failed to send password reset email:', error)
        throw error
      }
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: user.email,
          subject: 'Verify your VesperionGate account',
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 40px 20px; margin: 0;">
                <div style="max-width: 480px; margin: 0 auto; background-color: #171717; border-radius: 12px; padding: 32px; border: 1px solid #262626;">
                  <h1 style="color: #a78bfa; margin: 0 0 24px 0; font-size: 24px; font-weight: 600;">VesperionGate</h1>
                  <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 500;">Verify Your Email</h2>
                  <p style="color: #a1a1aa; margin: 0 0 24px 0; line-height: 1.6;">
                    Hi ${user.name || 'there'},<br><br>
                    Please click the button below to verify your email address and complete your account setup.
                  </p>
                  <a href="${url}" style="display: inline-block; background-color: #7c3aed; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 500; margin-bottom: 24px;">
                    Verify Email Address
                  </a>
                  <p style="color: #71717a; font-size: 14px; margin: 24px 0 0 0; line-height: 1.5;">
                    Or copy this link:<br>
                    <span style="color: #a78bfa; word-break: break-all;">${url}</span>
                  </p>
                  <p style="color: #52525b; font-size: 12px; margin: 24px 0 0 0;">
                    This link expires in 24 hours. If you didn't request this, you can safely ignore this email.
                  </p>
                </div>
              </body>
            </html>
          `,
        })
      } catch (error) {
        console.error('Failed to send verification email:', error)
        throw error
      }
    },
  },

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['credential'],
    },
  },

  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'admin',
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },

  advanced: {
    cookiePrefix: 'vesperion',
  },
})

// Password reset email function
export async function sendPasswordResetEmail(email: string, url: string, name?: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Reset your VesperionGate password',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 40px 20px; margin: 0;">
            <div style="max-width: 480px; margin: 0 auto; background-color: #171717; border-radius: 12px; padding: 32px; border: 1px solid #262626;">
              <h1 style="color: #a78bfa; margin: 0 0 24px 0; font-size: 24px; font-weight: 600;">VesperionGate</h1>
              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 500;">Reset Your Password</h2>
              <p style="color: #a1a1aa; margin: 0 0 24px 0; line-height: 1.6;">
                Hi ${name || 'there'},<br><br>
                We received a request to reset your password. Click the button below to create a new password.
              </p>
              <a href="${url}" style="display: inline-block; background-color: #7c3aed; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 500; margin-bottom: 24px;">
                Reset Password
              </a>
              <p style="color: #71717a; font-size: 14px; margin: 24px 0 0 0; line-height: 1.5;">
                Or copy this link:<br>
                <span style="color: #a78bfa; word-break: break-all;">${url}</span>
              </p>
              <p style="color: #dc2626; font-size: 12px; margin: 24px 0 0 0;">
                This link expires in 1 hour. If you didn't request this, please ignore this email.
              </p>
            </div>
          </body>
        </html>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send password reset email:', error)
    return { success: false, error }
  }
}

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user

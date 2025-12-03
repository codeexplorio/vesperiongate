import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

// Routes that don't require authentication
const PUBLIC_BILLING_ROUTES = [
  '/billing/login',
  '/billing/forgot-password',
  '/billing/reset-password',
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only process billing routes
  if (!pathname.startsWith('/billing')) {
    return NextResponse.next()
  }

  // Enforce HTTPS in production
  const proto = request.headers.get('x-forwarded-proto') || 'http'
  if (process.env.NODE_ENV === 'production' && proto !== 'https') {
    const httpsUrl = new URL(request.url)
    httpsUrl.protocol = 'https:'
    return NextResponse.redirect(httpsUrl)
  }

  // Check for Better Auth session cookie (optimistic check)
  const sessionCookie = getSessionCookie(request, {
    cookiePrefix: 'vesperion',
  })

  const isPublicRoute = PUBLIC_BILLING_ROUTES.some(route => pathname.startsWith(route))

  // Allow public billing routes
  if (isPublicRoute) {
    // If already authenticated and trying to access login, redirect to dashboard
    if (sessionCookie && pathname === '/billing/login') {
      return NextResponse.redirect(new URL('/billing', request.url))
    }
    return NextResponse.next()
  }

  // Protected routes - check for session cookie
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/billing/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/billing/:path*'],
}

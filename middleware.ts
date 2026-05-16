import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken } from '@/lib/auth/sessionToken'

/**
 * Route protection middleware.
 *
 * Protected prefixes:
 *  - /dashboard/* — requires an authenticated session
 *  - /admin/*     — requires an authenticated session AND role === 'admin'
 *
 * Authentication state is carried by a single HttpOnly `auth-session` cookie
 * containing an HMAC-signed `{uid, role, exp}` payload. The cookie is issued
 * by `POST /api/auth/session` only after the server verifies a Firebase ID
 * token via firebase-admin. Tokens that are missing, malformed, tampered, or
 * expired are treated as unauthenticated.
 *
 * Unauthenticated users are redirected to /auth/login with the original path
 * preserved as the `redirect` query param. Authenticated non-admin users
 * hitting /admin are redirected to /dashboard. Sessions that fail
 * verification on a protected route are also cleared so the client doesn't
 * keep retrying with a bad cookie.
 */

const LOGIN_PATH = '/auth/login'
const DASHBOARD_PATH = '/dashboard'
const ADMIN_PREFIX = '/admin'
const DASHBOARD_PREFIX = '/dashboard'
const SESSION_COOKIE = 'auth-session'
const LEGACY_COOKIES = ['x-user-id', 'x-user-role'] as const

function clearSessionCookies(res: NextResponse): NextResponse {
  res.cookies.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 })
  for (const name of LEGACY_COOKIES) {
    res.cookies.set(name, '', { path: '/', maxAge: 0 })
  }
  return res
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isAdmin = pathname.startsWith(ADMIN_PREFIX)
  const isDashboard = pathname.startsWith(DASHBOARD_PREFIX)
  if (!isAdmin && !isDashboard) return NextResponse.next()

  const token = req.cookies.get(SESSION_COOKIE)?.value
  const session = await verifySessionToken(token)
  if (!session) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = LOGIN_PATH
    loginUrl.search = ''
    loginUrl.searchParams.set('redirect', pathname)
    // Clear the bad cookie (if any) so the client stops sending it.
    return clearSessionCookies(NextResponse.redirect(loginUrl))
  }

  if (isAdmin && session.role !== 'admin') {
    const dashUrl = req.nextUrl.clone()
    dashUrl.pathname = DASHBOARD_PATH
    dashUrl.search = ''
    return NextResponse.redirect(dashUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}

import { NextRequest, NextResponse } from 'next/server'

/**
 * Route protection middleware.
 *
 * Protected prefixes:
 *  - /dashboard/* — requires an authenticated session (`x-user-id` cookie)
 *  - /admin/*     — requires an authenticated session AND `x-user-role === 'admin'`
 *
 * Both cookies are HttpOnly and are set by `POST /api/auth/session` only after the
 * server verifies a Firebase ID token via firebase-admin. Unauthenticated users are
 * redirected to /auth/login with the original path preserved as the `redirect` query
 * param. Authenticated non-admin users hitting /admin are redirected to /dashboard.
 */

const LOGIN_PATH = '/auth/login'
const DASHBOARD_PATH = '/dashboard'
const ADMIN_PREFIX = '/admin'
const DASHBOARD_PREFIX = '/dashboard'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isAdmin = pathname.startsWith(ADMIN_PREFIX)
  const isDashboard = pathname.startsWith(DASHBOARD_PREFIX)
  if (!isAdmin && !isDashboard) return NextResponse.next()

  const userId = req.cookies.get('x-user-id')?.value
  if (!userId) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = LOGIN_PATH
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAdmin) {
    const role = req.cookies.get('x-user-role')?.value
    if (role !== 'admin') {
      const dashUrl = req.nextUrl.clone()
      dashUrl.pathname = DASHBOARD_PATH
      dashUrl.search = ''
      return NextResponse.redirect(dashUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}

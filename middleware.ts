import { NextRequest, NextResponse } from 'next/server'

/**
 * Route protection middleware.
 *
 * Protected prefixes:
 *  - /dashboard/* — requires an authenticated session (x-user-id cookie)
 *  - /admin/*     — requires an authenticated session (redirects to /dashboard/admin for proper checks)
 *
 * Authentication is handled client-side via Firebase Auth. The middleware provides
 * a lightweight server-side guard using the `x-user-id` cookie that is set by the
 * AuthProvider once the user is verified. Unauthenticated users are redirected to
 * /auth/login with the original path preserved as the `redirect` query param.
 */

const PROTECTED_PREFIXES = ['/dashboard', '/admin']
const LOGIN_PATH = '/auth/login'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  if (!isProtected) return NextResponse.next()

  // The AuthProvider sets this cookie after successful Firebase sign-in verification.
  const userId = req.cookies.get('x-user-id')?.value

  if (!userId) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = LOGIN_PATH
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}

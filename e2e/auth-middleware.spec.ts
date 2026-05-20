import { expect, test, type APIRequestContext, type APIResponse } from '@playwright/test';
import { createSessionToken } from '../lib/auth/sessionToken';

/**
 * End-to-end coverage for the route-protection middleware in `middleware.ts`.
 *
 * The middleware reads a single HMAC-signed `auth-session` cookie that
 * `POST /api/auth/session` issues after verifying a Firebase ID token. These
 * tests mint that cookie directly using `lib/auth/sessionToken` so we can
 * exercise the cookie round-trip without standing up Firebase. The Playwright
 * `webServer` is started with the same `AUTH_SESSION_SECRET` (see
 * `playwright.config.ts`), so the server accepts what the tests sign.
 *
 * Tracks `docs/NEXT_UP.md` task #6.
 */

const SESSION_COOKIE = 'auth-session';
const LEGACY_COOKIES = ['x-user-id', 'x-user-role'] as const;

type RequestFn = APIRequestContext['get'];

async function getNoRedirect(
  request: APIRequestContext,
  path: string,
  cookie?: string,
): Promise<APIResponse> {
  const opts: Parameters<RequestFn>[1] = { maxRedirects: 0 };
  if (cookie) {
    opts.headers = { cookie: `${SESSION_COOKIE}=${cookie}` };
  }
  return request.get(path, opts);
}

function locationOf(res: APIResponse): string {
  return res.headers()['location'] ?? '';
}

function setCookieHeaders(res: APIResponse): string[] {
  const headers = res.headersArray();
  return headers.filter((h) => h.name.toLowerCase() === 'set-cookie').map((h) => h.value);
}

function expectClearedCookie(res: APIResponse, name: string) {
  const cookies = setCookieHeaders(res);
  // A cleared cookie is set with an empty value and a Max-Age of 0 (or an
  // Expires in the past). Next.js renders it as `name=; Path=/; Max-Age=0`.
  const cleared = cookies.find(
    (c) => c.startsWith(`${name}=`) && /(Max-Age=0\b|Expires=Thu, 01 Jan 1970)/i.test(c),
  );
  expect(
    cleared,
    `Expected response to clear cookie "${name}". Set-Cookie headers were: ${JSON.stringify(cookies)}`,
  ).toBeTruthy();
}

test.describe('route protection middleware', () => {
  test.describe('unauthenticated requests', () => {
    test('GET /dashboard redirects to /auth/login with preserved redirect target', async ({
      request,
    }) => {
      const res = await getNoRedirect(request, '/dashboard');
      expect(res.status()).toBe(307);
      const location = locationOf(res);
      expect(location).toContain('/auth/login');
      expect(location).toContain('redirect=%2Fdashboard');
    });

    test('GET /admin redirects to /auth/login (not /dashboard) when no session is present', async ({
      request,
    }) => {
      const res = await getNoRedirect(request, '/admin');
      expect(res.status()).toBe(307);
      const location = locationOf(res);
      expect(location).toContain('/auth/login');
      expect(location).toContain('redirect=%2Fadmin');
    });

    test('redirect response also clears the auth-session and legacy cookies', async ({
      request,
    }) => {
      const res = await getNoRedirect(request, '/dashboard');
      expectClearedCookie(res, SESSION_COOKIE);
      for (const legacy of LEGACY_COOKIES) {
        expectClearedCookie(res, legacy);
      }
    });
  });

  test.describe('tampered or expired sessions', () => {
    test('tampered cookie is rejected and the user is redirected to /auth/login', async ({
      request,
    }) => {
      const valid = await createSessionToken('user-tamper', 'worker');
      // Flip the last character of the signature to invalidate the HMAC while
      // preserving the overall shape (<payload>.<sig>).
      const tampered = valid.slice(0, -1) + (valid.slice(-1) === 'a' ? 'b' : 'a');

      const res = await getNoRedirect(request, '/dashboard', tampered);
      expect(res.status()).toBe(307);
      expect(locationOf(res)).toContain('/auth/login');
      expectClearedCookie(res, SESSION_COOKIE);
    });

    test('expired cookie is rejected and the user is redirected to /auth/login', async ({
      request,
    }) => {
      const expired = await createSessionToken('user-expired', 'worker', -60);

      const res = await getNoRedirect(request, '/dashboard', expired);
      expect(res.status()).toBe(307);
      expect(locationOf(res)).toContain('/auth/login');
      expectClearedCookie(res, SESSION_COOKIE);
    });

    test('garbage cookie value is rejected', async ({ request }) => {
      const res = await getNoRedirect(request, '/dashboard', 'not-a-real.token');
      expect(res.status()).toBe(307);
      expect(locationOf(res)).toContain('/auth/login');
    });
  });

  test.describe('valid sessions', () => {
    test('worker session may reach /dashboard (middleware does not redirect to /auth/login)', async ({
      request,
    }) => {
      const cookie = await createSessionToken('user-worker', 'worker');
      const res = await getNoRedirect(request, '/dashboard', cookie);

      // Middleware passes the request through; the page itself may render
      // (200) or error (5xx) because runtime data sources aren't available in
      // the E2E environment. The contract under test is "no auth redirect".
      expect(res.status()).not.toBe(307);
      const location = locationOf(res);
      expect(location).not.toContain('/auth/login');
    });

    test('non-admin session hitting /admin is redirected to /dashboard (not /auth/login)', async ({
      request,
    }) => {
      const cookie = await createSessionToken('user-worker-admin-probe', 'worker');
      const res = await getNoRedirect(request, '/admin', cookie);

      expect(res.status()).toBe(307);
      const location = locationOf(res);
      expect(location).toContain('/dashboard');
      expect(location).not.toContain('/auth/login');
    });

    test('admin session may reach /admin', async ({ request }) => {
      const cookie = await createSessionToken('user-admin', 'admin');
      const res = await getNoRedirect(request, '/admin', cookie);

      expect(res.status()).not.toBe(307);
      const location = locationOf(res);
      expect(location).not.toContain('/auth/login');
      expect(location).not.toContain('/dashboard');
    });
  });

  test.describe('public routes are unaffected', () => {
    test('GET / is not gated by the auth middleware', async ({ request }) => {
      const res = await getNoRedirect(request, '/');
      expect(res.status()).toBeLessThan(400);
    });

    test('GET /auth/login is not gated by the auth middleware', async ({ request }) => {
      const res = await getNoRedirect(request, '/auth/login');
      expect(res.status()).toBeLessThan(400);
    });
  });
});

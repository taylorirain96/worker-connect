# Known Issues (Baseline Validation)

Last validated: 2026-05-11

## Lint / Build warnings

_None_ — lint and build both pass cleanly on Next.js 15.5.18.

## Dependency / maintenance concerns

- `npm ci` reports deprecated transitive packages (`eslint@8`, `glob@7`, `rimraf@3`, others).
- 21 vulnerabilities remain in the dependency tree (`8 low`, `12 moderate`, `1 high`).
  - The 1 **critical** `protobufjs` vulnerability was resolved via `npm audit fix`.
  - `next` was upgraded all the way to **15.5.18** — all Next.js CVEs are now patched (DoS, SSRF, cache poisoning, image injection, HTTP smuggling, deserialization).
  - `@tootallnate/once` / `firebase-admin` transitive vulnerability requires downgrading `firebase-admin` to v10 (breaking change); deferred.
  - `undici` / `firebase` transitive vulnerabilities require downgrading `firebase` to v12.13.0 (breaking change); deferred.
  - `postcss` bundled inside `next/node_modules/postcss` — advisory may be stale; Next.js 15.5.18 is fully patched per the advisory database.
  - Dependabot is configured (`.github/dependabot.yml`) and will automatically open PRs for these.
  - CI now runs `npm audit --omit=dev --audit-level=high` via `.github/workflows/security-audit.yml` to fail fast on new high/critical vulnerabilities.

## Notes

- `npm run lint` and `npm run build` both pass.
- NZ Licence Verification uses live MBIE/provider verification when `MBIE_LICENCE_VERIFICATION_URL` is configured; otherwise it falls back to legacy pattern checks in `app/api/worker-trade-licences/verify/route.ts`.
- Business verification routes now call configurable provider endpoints (`BUSINESS_VERIFICATION_*_URL`) and fail closed with `503` when provider integrations are unavailable.
- Service and city/region pages now use `lib/seo/serviceRatings.ts` Firestore-backed aggregate review data (no hardcoded mock aggregateRating payloads).

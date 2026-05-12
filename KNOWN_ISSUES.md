# Known Issues (Baseline Validation)

Last validated: 2026-05-12

## Lint / Build warnings

_None_ — lint and build both pass cleanly on Next.js 15.5.18.

## Dependency / maintenance concerns

- `npm ci` reports deprecated transitive packages (`eslint@8`, `glob@7`, `rimraf@3`, others).
- 10 vulnerabilities remain in the dependency tree (`8 low`, `2 moderate`).
  - `next` is on **15.5.18** — all Next.js CVEs are patched (DoS, SSRF, cache poisoning, image injection, HTTP smuggling, deserialization).
  - `firebase` is on **^12.13.0** and `firebase-admin` is on **^13.9.0** — the previously-deferred breaking upgrades that closed the `@tootallnate/once` and `undici` advisories are now done.
  - Remaining 2 moderate findings are transitive (`postcss` inside `next/node_modules/postcss`, plus `google-gax` / `retry-request` chain inside `firebase-admin`). The only `npm audit fix --force` path downgrades `next` to v9 (breaking) and is **not** safe.
  - Dependabot is configured (`.github/dependabot.yml`) and will automatically open PRs for these.
  - CI runs `npm audit --omit=dev --audit-level=high` via `.github/workflows/security-audit.yml` to fail fast on new high/critical vulnerabilities.

## Notes

- `npm run lint` and `npm run build` both pass.
- NZ Licence Verification uses live MBIE/provider verification when `MBIE_LICENCE_VERIFICATION_URL` is configured; otherwise it falls back to legacy pattern checks in `app/api/worker-trade-licences/verify/route.ts`.
- Business verification routes now call configurable provider endpoints (`BUSINESS_VERIFICATION_*_URL`) and fail closed with `503` when provider integrations are unavailable.
- Service and city/region pages now use `lib/seo/serviceRatings.ts` Firestore-backed aggregate review data (no hardcoded mock aggregateRating payloads).

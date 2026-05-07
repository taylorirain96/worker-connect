# Known Issues (Baseline Validation)

Last validated: 2026-05-07

## Lint / Build warnings

_None_ — lint and build both pass cleanly.

## Dependency / maintenance concerns

- `npm ci` reports deprecated transitive packages (`eslint@8`, `glob@7`, `rimraf@3`, others).
- 24 vulnerabilities remain in the dependency tree (`8 low`, `11 moderate`, `5 high`).
  - The 1 **critical** `protobufjs` vulnerability was resolved via `npm audit fix`.
  - `next` was upgraded from `14.2.29` → `14.2.35`, patching 6 Next.js CVEs (information exposure, cache poisoning, SSRF, content injection, DoS, HTTP smuggling).
  - 5 remaining Next.js CVEs (GHSA-9g9p, GHSA-h25m, GHSA-ggv3, GHSA-3x4c, GHSA-q4gf) require `next@16+` — a breaking major-version upgrade deferred until full Next.js 15/16 migration.
  - `firebase-admin` / `firebase` transitive vulnerabilities require downgrading `firebase-admin` to v10 (breaking change); deferred.
  - Dependabot is configured (`.github/dependabot.yml`) and will automatically open PRs for these.

## Notes

- `npm run lint` and `npm run build` both pass.
- Follow-up should prioritize migrating to Next.js 15/16 and re-running full regression checks.
- NZ Licence Verification currently uses pattern-matching only (not a live MBIE API call). Real MBIE integration can replace `app/api/worker-trade-licences/verify/route.ts` when the public register API becomes available.
- Business verification stubs (`/api/business/verify/*`) use simulated responses — real integrations (Checkr, insurance providers, state licensing DB) are deferred.
- `/services/[service]` and city/region pages use mock `aggregateRating` data — can be replaced with real per-service review aggregation once volume exists.

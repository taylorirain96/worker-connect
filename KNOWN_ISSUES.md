# Known Issues (Baseline Validation)

Last validated: 2026-05-07

## Lint / Build warnings

- `app/dashboard/jobseeker/profile/page.tsx:360` — `@next/next/no-img-element`
- `app/dashboard/jobseeker/profile/page.tsx:685` — `@next/next/no-img-element`

## Dependency / maintenance concerns

- `npm ci` reports deprecated transitive packages (`eslint@8`, `glob@7`, `rimraf@3`, others).
- `npm ci` reports 25 vulnerabilities in the dependency tree (`8 low`, `11 moderate`, `5 high`, `1 critical`).

## Notes

- `npm run lint` and `npm run build` both pass.
- Follow-up should prioritize moving to a patched Next.js version and re-running full regression checks.

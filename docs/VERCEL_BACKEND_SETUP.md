# BuildFlow independent Vercel backend

This is a staged implementation; **not yet independent of Base44**.

## Current deployment
- React/Vite frontend at Vercel.
- /api/health and /api/backend-readiness for diagnostics.
- /api/projects guarded against use until persistence and auth are implemented.
- /api/auth/session fails closed while independent authentication is unconfigured.
- PostgreSQL schema and RLS policy are source files only, not applied.

## Required external resources
1. Provision an independent PostgreSQL database and verify secure backups.
2. Add DATABASE_URL as a **server-only** Vercel secret scoped first to Preview.
3. Configure a trusted authentication provider (Google OIDC and server-verified sessions).
4. Map provider identity to app_users; never accept client-provided owner IDs.
5. Implement parameterized SQL queries and transaction-scoped owner claims.
6. Export and migrate Base44 records, validate counts and ownership.
7. Replace **all** SDK uses before removing Base44 dependencies.
8. Test Stripe in sandbox using server-side keys and verified webhooks.
9. Promote only after functional and security tests pass.

Never put database passwords, OAuth client secrets, signing secrets, or Stripe secret keys into VITE_* variables or Git.

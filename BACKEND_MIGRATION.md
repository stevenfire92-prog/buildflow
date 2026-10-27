# BuildFlow backend migration

This branch begins a staged migration from Base44 to Vercel. It is **not yet a complete or independent backend**.

## Implemented
- `GET /api/health`: Vercel-hosted health check with no Base44 SDK or credentials.
- `src/lib/vercelApi.js`: same-origin frontend API transport.
- Existing Vite frontend, routes, authentication and production configuration remain unchanged.

## Still required before removing Base44
1. Inventory all `base44.*` calls (entities, auth, functions, integrations, uploads and subscriptions).
2. Provision an independent database and data migration with verified backups.
3. Replace Base44 authentication with server-verified sessions and secure founder access; migrate users securely, never copy passwords.
4. Move each backend function, access-control policy, and upload workflow to server-side APIs.
5. Move Stripe checkout and webhook verification to server-only secrets and durable idempotent processing; test in sandbox.
6. Migrate dependent frontend calls and validate end-to-end flows in Preview.
7. Remove Base44 SDK and Vite plugin only after all runtime dependencies have been eliminated.

Never expose Stripe secret keys or database credentials in `VITE_*` variables.

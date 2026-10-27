# Vercel backend migration — staged rollout

This repository is still dependent on Base44 for some existing business functions. Do not remove `@base44/sdk` or its existing auth/functions until replacements pass acceptance tests.

## New Vercel-native route
- `GET /api/health`: confirms the Vercel function runtime is reachable; reports migration status but deliberately does not reveal environment values or secrets.
- This status route is **not** proof that AI generation, Stripe, authentication, database persistence or entitlements work.

## Required migration sequence
1. Set up a managed persistent database and secure authentication provider; migrate accounts and app data with owner authorization and backups.
2. Implement server-side authenticated founder entitlements and verified paid subscription access; never trust browser/localStorage flags.
3. Move application-specific entity APIs and AI generation to Vercel functions with rate limits, usage accounting, and graceful provider failures.
4. Implement Stripe Checkout and billing portal with server-held credentials, signed webhook validation, and idempotent event processing. Start in test mode.
5. Confirm customer and founder flows, persistence, 401/403 handling, data export, webhook replay, and rollback on isolated Vercel previews.
6. After acceptance testing, switch frontend calls, then retire Base44 dependencies. Keep existing production traffic unchanged until then.

**Hosting note:** A founder's free membership cannot bypass infrastructure provider billing, usage quotas, outages, or legal requirements. Never log or publish API keys.

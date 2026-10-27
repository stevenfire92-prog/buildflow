# Vercel-first backend architecture

**Decision:** GitHub is the source of truth; Vercel hosts frontend and HTTP/API server functions for this application and future Se Fire Tech web products. Base44 is a legacy dependency to be retired after tested replacements are operational.

## Required backend capabilities
- **Auth:** a standards-based identity provider with server-verified sessions; never grant founder status based on client storage, query parameters or user-entered email.
- **Data:** a durable managed SQL database with backups, authorization and migration/export tools; Vercel functions alone do not persist application records.
- **AI:** Vercel API route with server-held model credentials, per-user rate limits and provider error handling. Founder membership waives *application* subscription fees but cannot bypass metered provider costs.
- **Payments:** server-side Stripe Checkout + customer portal, restricted origins, signed webhook event verification, idempotency, verified subscription entitlements, and test-mode acceptance before live release.
- **Media:** external object storage for books/audio and large assets, accessed through signed links when private.
- **Games:** browser-hosted free-play games may be static, with no deposits/cash-out; any Ontario real-money games require a separate licensed/compliant implementation.

## Cutover rules
1. Inventory every existing Base44 call and exported dataset, and retain backups.
2. Provision credentials securely in Vercel environment settings. Never commit or print secrets.
3. Implement new API services on an isolated feature branch and run unit/integration tests.
4. Validate owner login, founder privilege, regular-user paid tiers, database row-level access, AI limits, Stripe test checkout, webhook signatures, failure cases and rollback.
5. Move frontend traffic to tested routes using a reversible rollout; monitor errors.
6. Remove Base44 SDK/plugins/functions *only after* parity and migration validation; deleting them early breaks live functionality.
7. Treat new web products as Vercel-first from day one. Native mobile app builds/store distribution and backend infrastructure require separate services.

## Deployment status
This document sets architecture policy, not proof of successful migration. Production traffic and live payment settings must not change until their backend integrations pass verification.

# BuildFlow Base44 removal — gated production migration

The existing production app uses Base44 SDK calls across authentication,
entities, functions and integrations. Do NOT uninstall @base44/sdk or
@base44/vite-plugin until all consumers are migrated.

- [x] Add Vercel-independent health endpoint and same-origin client.
- [x] Add independent PostgreSQL core schema.
- [x] Add server readiness endpoint that fails closed until migration passes.
- [ ] Provision private PostgreSQL database; securely configure DATABASE_URL in Vercel (server only).
- [ ] Select and configure an independent identity provider, session validation, Google OAuth and founder access.
- [ ] Migrate existing user data after export and verified backup (do not copy passwords).
- [ ] Implement owner-scoped CRUD API for projects and all other entities.
- [ ] Convert client calls from base44.* to own API and test flows.
- [ ] Implement and sandbox-test Stripe Checkout and signature-verified idempotent webhooks.
- [ ] Test all auth/authorization, storage and payment workflows in Preview.
- [ ] Remove remaining Base44 imports, package/plugin, variables and branding references.
- [ ] Release to production only after end-to-end verification and rollback plan.

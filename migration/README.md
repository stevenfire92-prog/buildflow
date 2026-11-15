# Vercel backend migration: BuildFlow

Status: initialized for review; no runtime switch or database migration executed.

The website frontend is already on Vercel. It still uses Base44 authentication, records and integrations. Changing DNS alone will not eliminate that dependency. Replacement providers have their own billing and quotas.

## Source inventory

- 10 entity definitions
- 19 backend functions
- 8 workflows and 5 connector definitions
- Static SDK references and source locations: inventory.json
- Intended app, domain, Vercel target and Stripe account: target.json

Regenerate with `python migration/audit.py`. This tool reads only source under src, api and base44; it never opens environment files, customer data or credentials. Computed SDK references may need manual review. The inventory lists connector definitions, not proof of active connections.

## Implementation stages

1. Confirm the canonical Vercel project. Dr Build AI has multiple candidates; do not choose a deployment based on its name alone.
2. Provision an independent PostgreSQL database, authentication and object storage. Keep production and preview resources separate. Record names of required environment variables; store values only in secret management. Do not run database migrations until linking and credentials are verified.
3. Export authorized Base44 records and files to private storage with counts and checksums. Preserve source IDs, creator IDs and dates. Never commit exports. User passwords and OAuth tokens must not be assumed exportable. Plan verified user enrollment/password reset and a reviewed user-ID mapping; do not link accounts merely by a browser-supplied email.
4. Translate each entity's ownership/admin rules into server-side authorization. Subscription records are server-write-only. Verify cross-user isolation and administrative access before importing production data.
5. Replace authentication first, then entity reads/writes, file operations, backend functions, OAuth connectors and scheduled workflows. Update the existing Vercel billing identity check, which still uses Base44 auth. Complete direct AI/email provider integrations and usage limits before removing Base44 metered calls.
6. Configure the intended live Stripe account in target.json; preserve existing customers/subscriptions and maintain a reviewed identity mapping. GlobePay's current Base44 integration incorrectly points to Dr Build Ai: do not copy that connection into the replacement.
7. Verify sandbox checkout, subscription/cancellation, Billing Portal, signed webhook replay handling, and paid entitlements using signed-in users. An unsigned webhook returning 400 or a homepage returning 200 does not establish working payments. Keep checkout disabled until verified.
8. Validate the complete app in an isolated preview, including login, account recovery, CRUD authorization, files, AI, errors and quotas. Run a rehearsed data import and rollback before cutover.
9. Perform final data sync with a reviewed write-freeze window. Attach the domain only after the replacement is verified. Apply the exact Vercel DNS records and preserve MX, SPF, DKIM and DMARC. Keep a recoverable Base44 snapshot; do not cancel Base44 before verifying the replacement.

## Exit criteria

- All inventoried Base44 calls replaced or explicitly retired.
- Authenticated user isolation and server-controlled paid entitlements verified.
- Imported record/file counts reconciled and backups restore successfully.
- Correct account identity, signed webhook delivery and payment lifecycle verified.
- Operational quotas, costs, monitoring and rollback reviewed.
- No secrets or customer data included in Git.

This draft contains inventory and migration instructions only. It does not deploy a replacement backend, resolve Stripe verification, transfer DNS or remove Base44's credit requirements yet.

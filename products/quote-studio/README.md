# Quote Studio by Se Fire Tech

A separate, Vercel-native product for independent service businesses. This application has **no Base44 dependencies**. It is isolated under `products/quote-studio`; deployment root must be this directory, not the parent BuildFlow app.

## Product and current status

Working local workspace: estimates, reusable services, business profile, search and status filters, discounts/tax/deposit totals, duplication, backup/restore, and printable estimates (browser Print → Save as PDF). Samples are explicitly labelled; new workspaces start empty. No customer email is sent automatically. Status is manually recorded and is not proof of acceptance or payment. Tax defaults to zero and must be set by each business.

Business model: a proposed recurring subscription for authenticated cloud estimates. The local preview remains free. Price and target Stripe account have **not** been selected. No income, demand, or sales have been verified. Do not advertise paid availability before completing the launch gates below.

Backend source includes verified Supabase email sign-in, account-scoped cloud quotes, server-selected Stripe Checkout, the Customer Portal, and a raw-body signed webhook. These integrations are **not externally configured or end-to-end verified**. `PAYMENTS_ENABLED` and `BILLING_VERIFIED` default false. No live Stripe products, prices, keys, webhooks, accounts, subscriptions or charges are created by deployment.

## Local commands

Node 24. `npm test` and `npm run build` need no installed third-party packages. `npm run dev` serves the built app at localhost:4173. Server-side Stripe operations require `npm install` (Stripe Node 23.0.0). No frontend dependency download, AI service or model credit is needed for quote calculations.

## Vercel configuration

Framework: Other. Node: 24.x. Root: `products/quote-studio`. Build: `npm run build`. Output: `public`. Deploy API routes from the `api` directory as Vercel Node functions. Preview first. This app does not use a SPA catch-all: missing API routes must stay errors.

## Required activation steps

1. Confirm product positioning, recurring price/currency, refund/cancellation terms, and the intended Stripe merchant account. Existing account mappings for other apps do not select this product's merchant.
2. Provision a dedicated Supabase database and Auth service. Apply `db/schema.sql`. Verify RLS and test that two users cannot read, write or overwrite each other's estimates. Verify all client roles are denied direct table/RPC access.
3. Configure Auth site URL and exact redirect allowlist. Enable email confirmations, SMTP delivery, abuse protections and rate limits. A magic link uses a short-lived bearer session; refresh tokens are not retained. Set `FOUNDER_USER_ID` only to the authenticated, verified founder's immutable user UUID. Do not use editable user metadata or an email supplied by a client to grant founder access.
4. Store `SUPABASE_SERVICE_ROLE_KEY` and `STRIPE_SECRET_KEY` as sensitive, server-only Vercel variables. Prefer an account-specific Stripe restricted key with only needed Account read, Customer write/read, Price read, Subscription read, Checkout write/read, Billing Portal write, Invoice read, and Charge read permissions. The webhook signing secret is server-only. Never put these values in `VITE_*`, source, or chat.
5. Configure the remaining names in `.env.example`. `APP_URL` is the exact HTTPS application origin. Use a sandbox with `STRIPE_MODE=test` first. Server-side account verification requires `STRIPE_ACCOUNT_ID` to match the key's account.
6. Create the approved recurring Product and Price in that same account, then set `STRIPE_PRICE_ID`. Confirm business tax obligations and registrations before deciding whether to enable Stripe Tax. `automatic_tax` is deliberately not enabled by this code. Quote tax calculations and the operator's subscription sales tax are separate concerns.
7. Register `/api/webhook` on the tested deployment. Subscribe to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`, `charge.dispute.created`, `charge.refunded`, `radar.early_fraud_warning.created`. Configure Customer Portal cancellation and payment management.
8. Test paid and unpaid Checkout events, asynchronous success/failure, signature rejection, event replay, concurrent webhook delivery, out-of-order events, renewal, past-due, cancellation, refund/dispute/fraud holds, expired sign-ins, RLS, founder verification, and client ownership enforcement. Set `BILLING_VERIFIED=true` and `PAYMENTS_ENABLED=true` only in a controlled test environment after dependencies are installed and the database is ready. These flags are operator attestations, not automatic test results.
9. Publish operator identity/contact details, privacy notice, terms, pricing and refund policy. Arrange backups and monitoring. Repeat functional tests with the correct production configuration before opening sales.

## Billing details and limits

The browser cannot choose its customer, plan price or founder status. Stripe Customer ID maps to a verified user UUID in the private database. Checkout success does not grant access. The webhook reads current Stripe subscription/invoice state and transactionally records event IDs and entitlement periods. A subscription must be active with a paid latest invoice and an unexpired billing period. Webhooks fail with a non-2xx response if storage fails so Stripe can retry. Risk events conservatively block the entire customer's cloud access for manual review; later renewal events do not clear the hold. An operator must review the incident and remove the hold deliberately. This is not an automated refund or dispute resolution service.

Checkout retries reuse one session in a 30-minute window. Before launch, concurrency tests must verify no duplicate active subscriptions under repeated requests. Local business profile and service library remain browser-local even in cloud mode; only estimates are synchronized. There is no team collaboration, automated email sending, payment collection for a business's own customers, or automated tax advice. Public quote acceptance source is now provided by the cleaning extension; activation requires the migration and tests below.

## Verification recorded during implementation

See `tests/` for calculation, input validation, HTML escaping, founder boundary, configuration gating and closed-by-default API checks. Those tests do not replace real Stripe events, SMTP delivery, a provisioned database, browser verification or cross-account authorization tests. No actual credentials are included.

## Cleaning workflow extension (not yet browser-verified or deployed)

Adds editable regular/deep/move-out scopes with business-entered rates, local repeat-customer records, per-estimate task checklists, follow-up due lists, email drafts, calendar reminder files, and private job cost/contribution estimates. These are software tools, not guaranteed market rates or earned profit. Customer records and service libraries remain on-device; estimates can sync after account configuration.

Cloud approval code creates 14-day, token-protected customer snapshots with internal costs excluded. The token is hashed at rest. Creation/edit/acceptance use database locks and ownership checks. Apply db/cleaning-migration.sql after schema.sql before enabling this feature. Link holders supply their name and consent; identity is not independently verified. Edits revoke existing review links. No public approvals are operational until cloud storage, schema and account membership are configured. Test concurrent edits/approvals and ownership isolation against a real database before use.

21 Node tests currently pass. Browser verification of the extension and database integration remains pending. Follow-up emails are drafts for manual review and sending. Calendar reminders require the user to import the .ics file; there is no automatic outbound messaging.

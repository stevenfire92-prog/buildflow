# Vercel payment deployment

The frontend routes payment operations to Vercel when hosted on vercel.app, or when VITE_PAYMENTS_BACKEND=vercel. Base44 authentication and data continue to use the hosted Base44 backend with the app's public ID; this is not a full Base44 migration. Base44 integration credits are still required for its AI services.

## Required sensitive environment variables

Set STRIPE_SECRET_KEY to a restricted Stripe key from the account pinned in api/_billing/config.js. Set STRIPE_WEBHOOK_SECRET to the signing secret for this deployment's endpoint. Never place either key in VITE_* variables, Git, chat, or logs. Set STRIPE_MODE=live and CHECKOUT_ENABLED=true only after test verification. The service checks the actual account ID and price on every checkout. Existing Base44 stored keys are not copied or decrypted.

Set APP_URL to the canonical HTTPS production origin. For a custom domain also set VITE_PAYMENTS_BACKEND=vercel and redeploy. Register POST /api/webhooks/stripe only after its signing secret is installed. Unknown or unsigned events are rejected. Test and live endpoint secrets must be separate.

## Sandbox

Set STRIPE_MODE=test, STRIPE_TEST_ACCOUNT_ID and separate test keys. Add STRIPE_TEST_PRICE_<PLAN>_<MONTHLY|YEARLY> for each plan. Test prices must match the catalog currency, amount and billing interval. Never point the sandbox at production credentials.

## Checkout and subscriptions

Only authenticated Base44 users may start checkout. The server chooses from fixed, account-specific Stripe prices. Browser-supplied price IDs, payment modes and external return URLs are rejected. A success-page query string cannot grant access: /api/verify-checkout checks the owned Stripe session and actual payment status. Entitlements are read from current Stripe subscriptions tied to the authenticated user and app, rather than browser storage or webhook delivery order. New checkout customers and subscriptions are tagged with app/user IDs. Existing subscriptions lacking those tags require a reviewed migration; they are not automatically claimed by matching an email address.

The webhook verifies the raw-body signature and retrieves the canonical event from the expected Stripe account before acknowledging. It deliberately makes no duplicate provisioning write; subscription access is derived from Stripe by /api/entitlements. External fulfillment, email delivery and usage-credit provisioning are not implemented by this handler. Do not advertise paid services or credits that have not been connected to enforcement and fulfillment.

BuildFlow's separate book checkout and Base44-dependent integrations still use the hosted Base44 backend; those require their own setup. This change does not claim to migrate all app features.

## Verification

Run node --test tests/billing.test.js and npm run build. Test real sandbox sign-in, checkout, declined and delayed payments, cancellations, and webhook retries before enabling live checkout. Local tests use mocks and test signatures, never real cards. A 503 from checkout with missing configuration is intentional and must not be presented as a successful checkout.

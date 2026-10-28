import { randomUUID } from 'node:crypto';

export const EVENTS = new Set([
  'checkout.session.completed', 'checkout.session.async_payment_succeeded',
  'checkout.session.async_payment_failed', 'customer.subscription.created',
  'customer.subscription.updated', 'customer.subscription.deleted',
  'invoice.paid', 'invoice.payment_failed',
]);

export class BillingError extends Error {
  constructor(status, code, message) { super(message); this.status = status; this.code = code; }
}

export function returnUrls(origin, path = '/') {
  const base = new URL(origin);
  if (base.protocol !== 'https:' || base.pathname !== '/' || base.search || base.hash || base.username || base.password) {
    throw new BillingError(503, 'invalid_app_origin', 'Payments are not configured.');
  }
  if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//') || path.includes('\\')) {
    throw new BillingError(400, 'invalid_return_path', 'Invalid return page.');
  }
  const target = new URL(path, base);
  if (target.origin !== base.origin) throw new BillingError(400, 'invalid_return_path', 'Invalid return page.');
  const success = new URL(target); success.searchParams.set('checkout', 'success');
  success.searchParams.set('session_id', '{CHECKOUT_SESSION_ID}');
  const cancel = new URL(target); cancel.searchParams.set('checkout', 'cancelled');
  return { success_url: success.href.replace('%7BCHECKOUT_SESSION_ID%7D', '{CHECKOUT_SESSION_ID}'), cancel_url: cancel.href };
}

export function choosePrice(config, body) {
  if (body.action || body.priceId || body.mode) throw new BillingError(400, 'unsupported_checkout_option', 'Choose a supported plan.');
  const key = body.plan || body.appSlug || body.appKey || config.defaultPlan;
  const billing = body.billing || 'monthly';
  if (!Object.hasOwn(config.plans, key) || !Object.hasOwn(config.plans[key], billing)) {
    throw new BillingError(400, 'invalid_plan', 'Choose a supported plan and billing period.');
  }
  return { key, billing, price: config.plans[key][billing] };
}

export function createBillingHandlers({ StripeClient, createClient, config, env }) {
  function origin() {
    return env.APP_URL || (env.VERCEL_ENV === 'preview' && env.VERCEL_URL ? `https://${env.VERCEL_URL}` : config.origin);
  }
  function stripeKey() {
    return env.STRIPE_SECRET_KEY || (config.legacySecretKeys || [])
      .map(name => env[name])
      .find(value => typeof value === 'string' && /^(sk|rk)_live_/.test(value));
  }
  // No secret values are ever returned, logged, or imported by the browser.
  async function stripe() {
    const mode = env.STRIPE_MODE || 'test';
    const key = stripeKey();
    const accountId = mode === 'live' ? config.accountId : env.STRIPE_TEST_ACCOUNT_ID;
    if (!['live', 'test'].includes(mode) || !accountId || typeof key !== 'string' ||
        !new RegExp(`^(sk|rk)_${mode}_`).test(key)) {
      throw new BillingError(503, 'payments_not_configured', 'Payments are not available yet. No charge was made.');
    }
    const client = new StripeClient(key, { apiVersion: '2026-09-30.endive', maxNetworkRetries: 2 });
    const account = await client.accounts.retrieve();
    if (account.id !== accountId) {
      throw new BillingError(503, 'stripe_account_mismatch', 'Payments are unavailable while the account connection is corrected.');
    }
    if (mode === 'live' && !account.charges_enabled) {
      throw new BillingError(503, 'stripe_account_not_ready', 'Payments are temporarily unavailable.');
    }
    return { client, live: mode === 'live' };
  }

  async function authenticate(req) {
    const authorization = req.headers?.authorization || '';
    if (!/^Bearer \S+$/.test(authorization)) throw new BillingError(401, 'login_required', 'Sign in to continue.');
    let user;
    try {
      const auth = createClient({ appId: config.appId, serverUrl: 'https://base44.app', token: authorization.slice(7), analytics: { enabled: false } });
      user = await auth.auth.me();
    } catch (error) {
      const status = error.status || error.response?.status;
      if (status !== 401 && status !== 403) throw new BillingError(503, 'identity_unavailable', 'Sign-in service is temporarily unavailable.');
      throw new BillingError(401, 'login_required', 'Sign in to continue.');
    }
    if (!user?.id || !user?.email) throw new BillingError(401, 'login_required', 'Sign in to continue.');
    return user;
  }

  function metadata(user, extra = {}) {
    return { base44_app_id: config.appId, base44_user_id: String(user.id), ...extra };
  }

  async function findCustomer(client, user, create = false) {
    const customers = await client.customers.list({ email: user.email, limit: 100 });
    const customer = customers.data.find(c => !c.deleted && c.metadata?.base44_app_id === config.appId && c.metadata?.base44_user_id === String(user.id));
    if (customer || !create) return customer;
    if (customers.has_more) throw new BillingError(503, 'customer_lookup_incomplete', 'Payments are temporarily unavailable.');
    return client.customers.create({ email: user.email, metadata: metadata(user) }, { idempotencyKey: `customer-${config.appId}-${user.id}` });
  }

  function wrap(action, allowGet = false) {
    return async (req, res) => {
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      if (req.method !== 'POST' && !(allowGet && req.method === 'GET')) {
        res.setHeader('Allow', allowGet ? 'GET, POST' : 'POST');
        return res.status(405).json({ error: 'method_not_allowed' });
      }
      try {
        if (req.headers?.origin && req.headers.origin !== new URL(origin()).origin) {
          throw new BillingError(403, 'origin_not_allowed', 'Request origin is not allowed.');
        }
        let body = req.body || {};
        if (typeof body === 'string') {
          if (body.length > 8192) throw new BillingError(413, 'body_too_large', 'Request is too large.');
          try { body = JSON.parse(body); } catch { throw new BillingError(400, 'invalid_json', 'Invalid request.'); }
        }
        if (!body || typeof body !== 'object' || Array.isArray(body)) throw new BillingError(400, 'invalid_body', 'Invalid request.');
        const result = await action(req, body);
        return res.status(200).json(result);
      } catch (error) {
        const known = error instanceof BillingError;
        return res.status(known ? error.status : 503).json({
          error: known ? error.code : 'payment_service_unavailable',
          message: known ? error.message : 'Payments are temporarily unavailable. Please try again later.',
        });
      }
    };
  }

  const checkout = wrap(async (req, body) => {
    const user = await authenticate(req);
    if (env.CHECKOUT_ENABLED !== 'true') throw new BillingError(503, 'checkout_disabled', 'Payments are not available yet. No charge was made.');
    const selection = choosePrice(config, body);
    const { client, live } = await stripe();
    const selectedId = live ? selection.price.id : env[`STRIPE_TEST_PRICE_${selection.key.toUpperCase()}_${selection.billing.toUpperCase()}`];
    if (!selectedId) throw new BillingError(503, 'test_price_not_configured', 'Test checkout is not configured.');
    const price = await client.prices.retrieve(selectedId);
    if (!price.active || price.livemode !== live || price.currency !== selection.price.currency ||
        price.unit_amount !== selection.price.amount || (price.recurring?.interval || null) !== selection.price.interval) {
      throw new BillingError(503, 'price_configuration_mismatch', 'This plan is temporarily unavailable.');
    }
    const customer = await findCustomer(client, user, true);
    const mode = price.recurring ? 'subscription' : 'payment';
    const tags = metadata(user, { plan: selection.key, billing: selection.billing });
    const session = await client.checkout.sessions.create({
      mode, customer: customer.id, client_reference_id: String(user.id),
      line_items: [{ price: selectedId, quantity: 1 }],
      ...returnUrls(origin(), body.returnPath || (body.appSlug ? `/apps?app=${encodeURIComponent(selection.key)}` : config.defaultReturnPath || '/')),
      metadata: tags,
      ...(mode === 'subscription' ? { subscription_data: { metadata: tags, billing_mode: { type: 'flexible' } } } : { payment_intent_data: { metadata: tags } }),
      integration_identifier: `vercel_${config.appId}_${randomUUID().replaceAll('-', '').slice(0, 8).replace(/[0-9]/g, 'a')}`,
    }, { idempotencyKey: `checkout-${config.appId}-${user.id}-${randomUUID()}` });
    if (!session.url || new URL(session.url).origin !== 'https://checkout.stripe.com') {
      throw new BillingError(503, 'invalid_checkout_response', 'Checkout could not be started.');
    }
    return { url: session.url, sessionId: session.id, id: session.id, priceId: selectedId };
  });

  const verify = wrap(async (req, body) => {
    const user = await authenticate(req);
    const id = body.sessionId || body.session_id;
    if (typeof id !== 'string' || !/^cs_(live|test)_[A-Za-z0-9]+$/.test(id)) throw new BillingError(400, 'invalid_session', 'Invalid checkout session.');
    const { client, live } = await stripe();
    const session = await client.checkout.sessions.retrieve(id);
    if (session.livemode !== live || session.client_reference_id !== String(user.id) || session.metadata?.base44_app_id !== config.appId) {
      throw new BillingError(403, 'session_not_owned', 'This checkout session belongs to another account.');
    }
    return { paid: session.status === 'complete' && session.payment_status === 'paid', status: session.status, payment_status: session.payment_status };
  });

  const entitlements = wrap(async req => {
    if (!req.headers?.authorization) return { authenticated: false, founder: false, plan: 'free', unlockedPlans: ['free'] };
    const user = await authenticate(req);
    const { client } = await stripe();
    const customer = await findCustomer(client, user);
    if (!customer) return { authenticated: true, founder: false, plan: 'free', unlockedPlans: ['free'] };
    // Stripe is the source of truth. No query-string, founder flag, or browser-supplied plan grants access.
    const subs = await client.subscriptions.list({ customer: customer.id, status: 'all', limit: 100 });
    if (subs.has_more) throw new BillingError(503, 'subscription_lookup_incomplete', 'Subscription lookup is temporarily unavailable.');
    const order = ['free', ...Object.keys(config.plans)];
    let plan = 'free';
    for (const sub of subs.data) {
      const key = sub.metadata?.plan;
      if (sub.metadata?.base44_app_id === config.appId && sub.metadata?.base44_user_id === String(user.id) &&
          ['active', 'trialing'].includes(sub.status) && Object.hasOwn(config.plans, key) && order.indexOf(key) > order.indexOf(plan)) plan = key;
    }
    return { authenticated: true, founder: false, plan, unlockedPlans: order.slice(0, order.indexOf(plan) + 1), lifetime: false, unlimitedCredits: false };
  }, true);

  const portal = wrap(async req => {
    const user = await authenticate(req);
    const { client } = await stripe();
    const customer = await findCustomer(client, user);
    if (!customer) throw new BillingError(404, 'customer_not_found', 'No billing account was found.');
    const session = await client.billingPortal.sessions.create({ customer: customer.id, return_url: new URL('/', origin()).href });
    return { url: session.url };
  });

  const webhook = async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'method_not_allowed' }); }
    if (!req.headers?.['stripe-signature']) return res.status(400).json({ error: 'missing_signature' });
    if (!env.STRIPE_WEBHOOK_SECRET || !stripeKey()) return res.status(503).json({ error: 'webhook_not_configured' });
    let data = Buffer.alloc(0);
    try {
      for await (const chunk of req) {
        data = Buffer.concat([data, Buffer.from(chunk)]);
        if (data.length > 1048576) return res.status(413).json({ error: 'body_too_large' });
      }
      const verifier = new StripeClient(stripeKey());
      let event;
      try { event = verifier.webhooks.constructEvent(data, req.headers['stripe-signature'], env.STRIPE_WEBHOOK_SECRET); }
      catch { return res.status(400).json({ error: 'invalid_signature' }); }
      const { client, live } = await stripe();
      if (event.livemode !== live) return res.status(400).json({ error: 'event_mode_mismatch' });
      // Fetching through the expected account also rejects events from another account.
      const canonical = await client.events.retrieve(event.id);
      if (canonical.livemode !== live || canonical.type !== event.type) return res.status(400).json({ error: 'event_account_mismatch' });
      // Access is derived from current Stripe subscription state by entitlements(), not from
      // delivery ordering. Replays are idempotent and delayed events cannot restore canceled access.
      return res.status(200).json({ received: true, status: EVENTS.has(event.type) ? 'verified' : 'ignored' });
    } catch { return res.status(503).json({ error: 'webhook_processing_failed' }); }
  };
  const readiness = wrap(async () => {
    const { live } = await stripe();
    return { configured: true, live, checkoutEnabled: env.CHECKOUT_ENABLED === 'true' };
  }, true);
  return { checkout, verify, entitlements, portal, webhook, readiness };
}

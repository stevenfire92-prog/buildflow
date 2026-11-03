// ============================================================================
// PayPal server helpers for Vercel serverless functions (Node 18+).
//
// USAGE:
//   Option A — single file:  save as api/paypal.js and route on req.query.action
//   Option B — split files:  save helpers here and import from
//                            api/paypal/create-order.js, capture-order.js, plans.js,
//                            subscription/[id].js, config.js (examples at bottom)
//
// ENV (see templates/paypal-env.md):
//   PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_MODE=live|sandbox
//   PAYPAL_PLAN_MONTHLY, PAYPAL_PLAN_YEARLY (created once via ensurePlans())
// ============================================================================

const MODE = process.env.PAYPAL_MODE === 'live' ? 'live' : 'sandbox';
const BASE =
  MODE === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

// In-memory token cache (per serverless instance; tokens live ~8h, we refresh early).
let tokenCache = null; // { token, expiresAt }

export function paypalMode() {
  return MODE;
}

export function isConfigured() {
  return !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

export function publicClientId() {
  return process.env.PAYPAL_CLIENT_ID || null;
}

// --- OAuth2 client-credentials bearer token ---------------------------------
export async function getAccessToken() {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) {
    throw new Error('PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET are not set');
  }
  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.token;
  }
  const basic = Buffer.from(`${id}:${secret}`).toString('base64');
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    throw new Error(`PayPal token error: ${data.error_description || data.error || res.status}`);
  }
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in || 28800) * 1000,
  };
  return data.access_token;
}

// --- Low-level REST helper ----------------------------------------------------
async function pp(path, { method = 'GET', body } = {}) {
  const token = await getAccessToken();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.message || data.error_description || (data.details || [])
      .map((d) => d.description)
      .join('; ');
    throw new Error(`PayPal API ${res.status}: ${msg || 'request failed'}`);
  }
  return data;
}

// --- One-time payments ---------------------------------------------------------
export async function createOrder(amount, description) {
  return pp('/v2/checkout/orders', {
    method: 'POST',
    body: {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: { currency_code: 'USD', value: String(amount) },
          description: description || 'Se Fire Pro upgrade',
        },
      ],
    },
  });
}

export async function captureOrder(orderId) {
  if (!orderId) throw new Error('orderId is required');
  return pp(`/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: 'POST',
    body: {},
  });
}

// --- Subscriptions --------------------------------------------------------------
export async function getSubscription(subscriptionId) {
  if (!subscriptionId) throw new Error('subscriptionId is required');
  return pp(`/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}`);
}

// --- Plans (run ONCE, then pin IDs in env) ----------------------------------------
const PLAN_DEFS = [
  { key: 'monthly', name: 'Se Fire Pro Monthly', value: '4.99', unit: 'MONTH' },
  { key: 'yearly', name: 'Se Fire Pro Yearly', value: '49.99', unit: 'YEAR' },
];

export async function ensurePlans() {
  const fromEnv = {
    monthly: process.env.PAYPAL_PLAN_MONTHLY,
    yearly: process.env.PAYPAL_PLAN_YEARLY,
  };
  if (fromEnv.monthly && fromEnv.yearly) return fromEnv;

  const product = await pp('/v1/catalogs/products', {
    method: 'POST',
    body: { name: 'Se Fire Pro', type: 'SERVICE' },
  });

  const out = {};
  for (const def of PLAN_DEFS) {
    if (fromEnv[def.key]) {
      out[def.key] = fromEnv[def.key];
      continue;
    }
    const plan = await pp('/v1/billing/plans', {
      method: 'POST',
      body: {
        product_id: product.id,
        name: def.name,
        billing_cycles: [
          {
            frequency: { interval_unit: def.unit, interval_count: 1 },
            tenure_type: 'REGULAR',
            sequence: 1,
            total_cycles: 0, // 0 = renew forever
            pricing_scheme: {
              fixed_price: { value: def.value, currency_code: 'USD' },
            },
          },
        ],
        payment_preferences: {
          auto_bill_outstanding: true,
          setup_fee_failure_action: 'CONTINUE',
          payment_failure_threshold: 3,
        },
      },
    });
    out[def.key] = plan.id;
  }

  // IMPORTANT: copy these into your env vars so plans are not duplicated.
  console.log('PAYPAL_PLAN_MONTHLY=' + out.monthly);
  console.log('PAYPAL_PLAN_YEARLY=' + out.yearly);
  return out;
}

// ============================================================================
// EXAMPLE Vercel route handlers — copy into api/paypal/*.js
// (Vercel style: export default async function handler(req, res) { ... })
// ============================================================================

/*
// api/paypal/config.js — public config for the client (safe: no secret)
import { publicClientId, isConfigured, paypalMode } from '../paypal.js';
export default async function handler(req, res) {
  res.status(200).json({
    configured: isConfigured(),
    clientId: publicClientId(),
    mode: paypalMode(),
  });
}

// api/paypal/create-order.js — one-time (Lifetime) payments
import { createOrder } from '../paypal.js';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { amount, description } = req.body || {};
    if (!amount) return res.status(400).json({ error: 'amount is required' });
    const order = await createOrder(amount, description);
    res.status(200).json({ id: order.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// api/paypal/capture-order.js — capture after buyer approval
import { captureOrder } from '../paypal.js';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { orderId } = req.body || {};
    if (!orderId) return res.status(400).json({ error: 'orderId is required' });
    const capture = await captureOrder(orderId);
    res.status(200).json({ status: capture.status, id: capture.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// api/paypal/plans.js — returns PayPal billing plan IDs for subscriptions
import { ensurePlans } from '../paypal.js';
export default async function handler(req, res) {
  try {
    const plans = await ensurePlans();
    res.status(200).json(plans); // { monthly, yearly }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// api/paypal/subscription/[id].js — verify a subscription after approval
import { getSubscription } from '../../paypal.js';
export default async function handler(req, res) {
  try {
    const sub = await getSubscription(req.query.id);
    res.status(200).json({ status: sub.status, id: sub.id, plan_id: sub.plan_id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
*/

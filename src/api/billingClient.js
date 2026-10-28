import { getAccessToken } from '@base44/sdk';

const ROUTES = {
  createCheckoutSession: '/api/checkout',
  getEntitlements: '/api/entitlements',
  verifyCheckoutSession: '/api/verify-checkout',
  createBillingPortalSession: '/api/billing-portal',
};

export function attachVercelBilling(client, params) {
  if (params.paymentsBackend !== 'vercel') return;
  const original = client.functions.invoke.bind(client.functions);
  client.functions.invoke = async (name, data = {}) => {
    if (!ROUTES[name]) return original(name, data);
    const token = getAccessToken();
    const response = await fetch(ROUTES[name], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    const result = await response.json().catch(() => ({ error: 'invalid_response' }));
    if (!response.ok) {
      const error = Object.assign(new Error(result.message || 'Payments are currently unavailable. Please try again later.'), {
        status: response.status,
        response: { status: response.status, data: result },
      });
      throw error;
    }
    return { data: result, status: response.status };
  };
}

export function validatedCheckoutUrl(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.hostname !== 'checkout.stripe.com') {
    throw new Error('Invalid Stripe checkout destination');
  }
  return url.href;
}

// Shared Stripe client for GlobePay API routes. Server-only.
import Stripe from 'stripe';

let stripeInstance = null;

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    const error = new Error('Stripe is not connected');
    error.statusCode = 503;
    error.code = 'stripe_not_configured';
    throw error;
  }
  if (!stripeInstance || stripeInstance._apiKey !== key) {
    stripeInstance = new Stripe(key, { apiVersion: '2024-06-20' });
    stripeInstance._apiKey = key;
  }
  return stripeInstance;
}

export function handleApiError(res, error) {
  const status = error?.statusCode || 500;
  res.setHeader('Cache-Control', 'no-store');
  return res.status(status).json({
    error: error?.code || 'request_failed',
    message: error?.message || 'Something went wrong.',
  });
}

export function fmtMoney(amount, currency = 'usd') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format((amount || 0) / 100);
}

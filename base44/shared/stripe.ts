export function getStripeHeaders(apiKey, extra = {}) {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Stripe-Version": "2025-10-29.clover",
    ...extra,
  };
}
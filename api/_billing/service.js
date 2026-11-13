// PURGED — legacy billing service removed by Steve's order (Nov 13, 2026).
// Payments run through PayPal only (see /api/paypal and src/components/PayPalCheckout.jsx).
// This module is retained only so legacy imports resolve; every handler is gone.
function gone(req, res) {
  return res.status(410).json({ error: 'gone', payments: 'paypal' });
}
export function createBillingHandlers() {
  return { checkout: gone, verifyCheckout: gone, entitlements: gone, webhook: gone, account: gone };
}
export default createBillingHandlers;

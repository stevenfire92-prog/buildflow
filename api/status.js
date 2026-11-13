// PURGED — legacy payment endpoint removed by Steve's order (Nov 13, 2026).
// Payments run through PayPal only (see /api/paypal). This endpoint is gone.
export default async function handler(req, res) {
  return res.status(410).json({ error: 'gone', payments: 'paypal' });
}

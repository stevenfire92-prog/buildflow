// PayPal one-time (Lifetime) order creation
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

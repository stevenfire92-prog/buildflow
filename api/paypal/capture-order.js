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

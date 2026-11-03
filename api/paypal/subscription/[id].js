// Verify a PayPal subscription after approval
import { getSubscription } from '../../paypal.js';
export default async function handler(req, res) {
  try {
    const sub = await getSubscription(req.query.id);
    res.status(200).json({ status: sub.status, id: sub.id, plan_id: sub.plan_id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

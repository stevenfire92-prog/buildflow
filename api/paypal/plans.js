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

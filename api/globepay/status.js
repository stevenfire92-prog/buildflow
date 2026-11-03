// GET /api/globepay/status — is Stripe connected?
import { getStripe, handleApiError } from './_stripe.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });
  try {
    const stripe = getStripe();
    const account = await stripe.accounts.retrieve();
    return res.status(200).json({
      connected: true,
      accountId: account.id,
      country: account.country,
      defaultCurrency: account.default_currency,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      livemode: !account.id.includes('test') && (process.env.STRIPE_SECRET_KEY || '').startsWith('sk_live'),
    });
  } catch (error) {
    if (error.code === 'stripe_not_configured') {
      return res.status(200).json({ connected: false });
    }
    return handleApiError(res, error);
  }
}

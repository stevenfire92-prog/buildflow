// Se Fire Tech — Stripe status endpoint
// Returns whether Stripe is configured (without exposing secrets).
export default async function handler(req, res) {
  const configured = !!process.env.STRIPE_SECRET_KEY;
  return res.status(200).json({
    stripe_configured: configured,
    mode: configured ? 'live' : 'demo',
    message: configured ? 'Payments enabled' : 'Demo mode — payments disabled until Stripe keys are configured.',
  });
}

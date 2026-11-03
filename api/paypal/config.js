// api/paypal/config.js — public config for the client (safe: no secret)
import { publicClientId, isConfigured, paypalMode } from '../paypal.js';
export default async function handler(req, res) {
  res.status(200).json({
    configured: isConfigured(),
    clientId: publicClientId(),
    mode: paypalMode(),
  });
}

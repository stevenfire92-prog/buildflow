// PayPal public config — safe for client (no secret exposed)
import { publicClientId, isConfigured, paypalMode } from '../paypal.js';
export default async function handler(req, res) {
  res.status(200).json({
    configured: isConfigured(),
    clientId: publicClientId(),
    mode: paypalMode(),
  });
}

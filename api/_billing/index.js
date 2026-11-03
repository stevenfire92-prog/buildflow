import StripeClient from 'stripe';
import config from './config.js';
import { createBillingHandlers } from './service.js';

// Local auth client stub — no Base44 SDK dependency.
// Validates bearer token format; user identity comes from the token itself.
function createClient({ token }) {
  return {
    auth: {
      me: async () => {
        if (!token) throw { status: 401 };
        // In local mode, accept any well-formed token as a test user.
        // Production should validate against a real identity provider.
        return { id: 'local_user', email: 'user@example.com' };
      },
    },
  };
}

export default createBillingHandlers({ StripeClient, createClient, config, env: process.env });

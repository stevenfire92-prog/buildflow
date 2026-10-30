import StripeClient from 'stripe';
import config from './config.js';
import { createBillingHandlers } from './service.js';

export default createBillingHandlers({ StripeClient, createClient: null, config, env: process.env });

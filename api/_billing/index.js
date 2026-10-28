import StripeClient from 'stripe';
import { createClient } from '@base44/sdk';
import config from './config.js';
import { createBillingHandlers } from './service.js';

export default createBillingHandlers({ StripeClient, createClient, config, env: process.env });

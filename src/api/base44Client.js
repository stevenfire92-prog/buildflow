import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { attachVercelBilling } from './billingClient';

const { appId, token, functionsVersion, appBaseUrl, serverUrl } = appParams;

export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl,
  appBaseUrl
});

attachVercelBilling(base44, appParams);

// Public deployment identifiers only. Never put Stripe keys in VITE_* variables.
export function resolveAppConfig(env = {}, hostname = '') {
  return {
    appId: env.VITE_APP_ID || APP_ID,
    appBaseUrl: env.VITE_APP_BASE_URL || HOSTED_ORIGIN,
    serverUrl: env.VITE_SERVER_URL || '',
    paymentsBackend: 'vercel',
  };
}
const APP_ID = "buildflow-independent";
const HOSTED_ORIGIN = "https://buildflow-independent-etk6x9roq-se-fire-tech.vercel.app";

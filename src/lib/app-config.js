// Public deployment identifiers only. Never put Stripe keys in VITE_* variables.
export function resolveAppConfig(env = {}, hostname = '') {
  const external = hostname.endsWith('.vercel.app') || env.VITE_PAYMENTS_BACKEND === 'vercel';
  return {
    appId: env.VITE_BASE44_APP_ID || APP_ID,
    appBaseUrl: env.VITE_BASE44_APP_BASE_URL || HOSTED_ORIGIN,
    serverUrl: env.VITE_BASE44_SERVER_URL || (external ? 'https://base44.app' : ''),
    paymentsBackend: external ? 'vercel' : 'base44',
  };
}
const APP_ID = "6aa0ac8456fc22afdf09666a";
const HOSTED_ORIGIN = "https://builderflowstudio.base44.app";

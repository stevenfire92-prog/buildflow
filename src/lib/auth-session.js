export async function readSession(client, token) {
  if (!token) return { user: null, error: null };
  try {
    const user = await client.auth.me();
    return { user: user || null, error: null };
  } catch (error) {
    const status = error.status || error.response?.status;
    if (status === 401 || status === 403) return { user: null, error: null };
    return { user: null, error: { type: 'service_unavailable', message: 'We could not check your session. Please try again.' } };
  }
}

export function publicSettingsError(error) {
  const status = error.status || error.response?.status;
  const reason = error.data?.extra_data?.reason || error.response?.data?.extra_data?.reason;
  if (status === 403 && ['auth_required', 'user_not_registered'].includes(reason)) {
    return { type: reason, message: 'Sign in to access this app.' };
  }
  return { type: 'service_unavailable', message: 'We could not load the app. Please try again.' };
}

export const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];

export function loginPath(location) {
  if (AUTH_PATHS.includes(location.pathname)) return '/login';
  const query = new URLSearchParams(location.search || '');
  for (const key of ['access_token', 'clear_access_token', 'app_id', 'app_base_url', 'functions_version', 'from_url']) query.delete(key);
  const destination = location.pathname + (query.size ? `?${query}` : '');
  return `/login?returnTo=${encodeURIComponent(destination.startsWith('/') && !destination.startsWith('//') && !destination.includes('\\') ? destination : '/')}`;
}

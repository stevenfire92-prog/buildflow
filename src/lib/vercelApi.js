// Client transport for independently hosted Vercel APIs.
// Requests stay same-origin and never expose server-side credentials.
export async function vercelApi(path, options = {}) {
  if (typeof path !== 'string' || !path.startsWith('/api/')) {
    throw new Error('Only same-origin /api/ paths are supported');
  }
  const response = await fetch(path, {
    credentials: 'same-origin',
    ...options,
    headers: { Accept: 'application/json', ...(options.headers || {}) }
  });
  if (!response.ok) {
    throw new Error('Vercel API request failed (' + response.status + ')');
  }
  return response.json();
}

export const checkVercelBackend = () => vercelApi('/api/health');

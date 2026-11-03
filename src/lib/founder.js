// Founder access — Steve gets everything free, forever.
// Activate via URL: ?founder=sefire2026 (sets persistent flag)
// Check with isFounder() before any paywall.
const FOUNDER_KEY = 'sfi:founder';
const FOUNDER_CODE = 'sefire2026';

// TEMPORARY: Free access for ALL users until Stripe payments go live.
// Steve's order Nov 2, 2026. To revert: set to false and redeploy.
export const FREE_ACCESS_UNTIL_STRIPE = true;

export function isFounder() {
  try {
    if (FREE_ACCESS_UNTIL_STRIPE) return true;
    return localStorage.getItem(FOUNDER_KEY) === 'true';
  } catch {
    return FREE_ACCESS_UNTIL_STRIPE;
  }
}

export function activateFounder(code) {
  if (code === FOUNDER_CODE) {
    try {
      localStorage.setItem(FOUNDER_KEY, 'true');
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export function checkFounderUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('founder');
    if (code && activateFounder(code)) {
      // Clean the URL
      const url = new URL(window.location.href);
      url.searchParams.delete('founder');
      window.history.replaceState({}, '', url.toString());
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

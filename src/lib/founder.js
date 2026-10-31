// Founder access — Steve gets everything free, forever.
// Activate via URL: ?founder=sefire2026 (sets persistent flag)
// Check with isFounder() before any paywall.
const FOUNDER_KEY = 'sfi:founder';
const FOUNDER_CODE = 'sefire2026';

export function isFounder() {
  try {
    return localStorage.getItem(FOUNDER_KEY) === 'true';
  } catch {
    return false;
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
      const url = new URL(window.location.href);
      url.searchParams.delete('founder');
      window.history.replaceState({}, '', url.toString());
      return true;
    }
  } catch {
  }
  return false;
}

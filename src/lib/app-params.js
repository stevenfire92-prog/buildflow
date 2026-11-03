// Local token helper — no Base44 SDK dependency.
function getAccessToken() {
  try {
    return localStorage.getItem('sfi:token') || null;
  } catch {
    return null;
  }
}
import { resolveAppConfig } from './app-config';

const isNode = typeof window === 'undefined';

const isClearAccessTokenRequested = () =>
	!isNode && new URLSearchParams(window.location.search).get("clear_access_token") === 'true';

const clearStoredAccessToken = () => {
	window.localStorage.removeItem('sfi:token');
	window.localStorage.removeItem('token');
}

const getAppParams = () => {
	if (isClearAccessTokenRequested()) {
		clearStoredAccessToken();
	}
	return {
		...resolveAppConfig(import.meta.env, isNode ? '' : window.location.hostname),
		token: getAccessToken(),
	}
}


export const appParams = {
	...getAppParams()
}

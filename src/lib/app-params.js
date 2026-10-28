import { getAccessToken } from '@base44/sdk';
import { resolveAppConfig } from './app-config';

const isNode = typeof window === 'undefined';

const isClearAccessTokenRequested = () =>
	!isNode && new URLSearchParams(window.location.search).get("clear_access_token") === 'true';

const clearStoredAccessToken = () => {
	window.localStorage.removeItem('base44_access_token');
	window.localStorage.removeItem('token');
}

const getAppParams = () => {
	if (isClearAccessTokenRequested()) {
		clearStoredAccessToken();
	}
	return {
		...resolveAppConfig(import.meta.env, isNode ? '' : window.location.hostname),
		token: getAccessToken(),
		functionsVersion: import.meta.env.VITE_BASE44_FUNCTIONS_VERSION,
	}
}


export const appParams = {
	...getAppParams()
}

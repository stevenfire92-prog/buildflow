import { getAccessToken } from '@/api/localClient';
import { resolveAppConfig } from './app-config';

const isNode = typeof window === 'undefined';

const isClearAccessTokenRequested = () =>
	!isNode && new URLSearchParams(window.location.search).get("clear_access_token") === 'true';

const clearStoredAccessToken = () => {
	window.localStorage.removeItem('bf:auth:token');
	window.localStorage.removeItem('bf_access_token');
	window.localStorage.removeItem('token');
}

const getAppParams = () => {
	if (isClearAccessTokenRequested()) {
		clearStoredAccessToken();
	}
	return {
		...resolveAppConfig(import.meta.env, isNode ? '' : window.location.hostname),
		token: getAccessToken(),
		paymentsBackend: 'vercel',
	}
}


export const appParams = {
	...getAppParams()
}

import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

import { APP_CONFIG } from '@/constants/config';

export type ApiError = {
	status: number;
	message: string;
	code?: string;
	details?: unknown;
	isNetworkError: boolean;
};

let bearerToken: string | null = null;
let tokenInvalidNotified = false;

// Callback for when token is invalid/expired (401/403)
let onTokenInvalid: (() => void) | null = null;

export const setApiAuthToken = (token: string | null) => {
	bearerToken = token;
	tokenInvalidNotified = false;
};

export const clearApiAuthToken = () => {
	bearerToken = null;
	tokenInvalidNotified = false;
};

/**
 * Register a callback to be called when the API detects an invalid/expired token (401/403).
 * Use this to trigger logout and redirect to login page.
 */
export const setOnTokenInvalidCallback = (callback: (() => void) | null) => {
	onTokenInvalid = callback;
};

export const getApiAuthToken = () => bearerToken;

export const setApiAuthExpiredHandler = (handler: (() => void) | null) => {
	authExpiredHandler = handler;
};

const onRequest = (config: InternalAxiosRequestConfig) => {
	const nextConfig = { ...config };
	nextConfig.headers = nextConfig.headers ?? {};

	if (bearerToken) {
		nextConfig.headers.Authorization = `Bearer ${bearerToken}`;
		if (!nextConfig.headers.Cookie) {
			nextConfig.headers.Cookie = `auth_token=${bearerToken}`;
		}
	}

	if (!nextConfig.headers.Accept) {
		nextConfig.headers.Accept = 'application/json';
	}

	if (!nextConfig.headers['Content-Type'] && nextConfig.data instanceof URLSearchParams) {
		nextConfig.headers['Content-Type'] = 'application/x-www-form-urlencoded';
	}

	if (!nextConfig.headers['Content-Type'] && !(nextConfig.data instanceof FormData) && !(nextConfig.data instanceof URLSearchParams)) {
		nextConfig.headers['Content-Type'] = 'application/json';
	}

	if (APP_CONFIG.api.debugLogsEnabled) {
		console.log('[api][request]', {
			method: nextConfig.method,
			url: nextConfig.url,
			hasAuth: Boolean(nextConfig.headers.Authorization),
		});
	}

	return nextConfig;
};

const normalizeApiError = (error: AxiosError): ApiError => {
	const status = error.response?.status ?? 0;
	const responseData = error.response?.data as
		| { message?: string; error?: string; code?: string; details?: unknown }
		| undefined;

	// Network error — no response received at all
	if (!error.response) {
		const isTimeout = error.code === 'ECONNABORTED';
		return {
			status: 0,
			message: isTimeout
				? 'Request timed out. Check your connection.'
				: `Network error — cannot reach server at ${APP_CONFIG.api.baseUrl}. Make sure the backend is running.`,
			isNetworkError: true,
		};
	}

	return {
		status,
		message:
			responseData?.message ??
			responseData?.error ??
			error.message ??
			'Something went wrong. Please try again.',
		code: responseData?.code,
		details: responseData?.details ?? error.response?.data,
		isNetworkError: false,
	};
};

const shouldLogoutForAuthError = (error: AxiosError) => {
	const status = error.response?.status ?? 0;
	if (status !== 401 && status !== 403) return false;

	const responseData = error.response?.data as
		| { message?: string; error?: string; requiresVerification?: boolean }
		| undefined;
	const message = `${responseData?.message ?? responseData?.error ?? ''}`.toLowerCase();

	if (responseData?.requiresVerification) {
		return false;
	}

	return (
		message.includes('expired') ||
		message.includes('invalid token') ||
		message.includes('invalid or expired token') ||
		message.includes('access token required') ||
		message.includes('unauthorized') ||
		message.includes('access denied') ||
		message.includes('no token provided')
	);
};

export const apiClient = axios.create({
	baseURL: APP_CONFIG.api.baseUrl,
	timeout: APP_CONFIG.api.timeoutMs,
	withCredentials: true,
	headers: {
		Accept: 'application/json',
	},
});

// Log the base URL once on startup so we can verify it in the console
if (__DEV__) {
	console.log('[api] baseURL =', APP_CONFIG.api.baseUrl);
}

apiClient.interceptors.request.use(onRequest, (error) => Promise.reject(error));

apiClient.interceptors.response.use(
	(response) => {
		if (APP_CONFIG.api.debugLogsEnabled) {
			console.log('[api][response]', {
				method: response.config.method,
				url: response.config.url,
				status: response.status,
			});
		}

		return response;
	},
	(error: AxiosError) => {
		const status = error.response?.status ?? 0;

		// Token is invalid or expired (401) or forbidden (403)
		// Trigger logout and redirect to login
		if ((status === 401 || status === 403) && onTokenInvalid && !tokenInvalidNotified) {
			tokenInvalidNotified = true;
			console.warn('[api] Token invalid/expired (status', status, '). Logging out.');
			onTokenInvalid();
		}

		return Promise.reject(normalizeApiError(error));
	}
);

export const createRequestConfig = (config: AxiosRequestConfig = {}): AxiosRequestConfig => ({
	...config,
});

export default apiClient;

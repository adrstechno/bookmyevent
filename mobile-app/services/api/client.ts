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

const onRequest = (config: InternalAxiosRequestConfig) => {
	const nextConfig = { ...config };
	nextConfig.headers = nextConfig.headers ?? {};

	if (bearerToken) {
		nextConfig.headers.Authorization = `Bearer ${bearerToken}`;
	}

	if (!nextConfig.headers.Accept) {
		nextConfig.headers.Accept = 'application/json';
	}

	if (!nextConfig.headers['Content-Type'] && !(nextConfig.data instanceof FormData)) {
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

	return {
		status,
		message:
			responseData?.message ??
			responseData?.error ??
			error.message ??
			'Something went wrong. Please try again.',
		code: responseData?.code,
		details: responseData?.details ?? error.response?.data,
		isNetworkError: !error.response,
	};
};

export const apiClient = axios.create({
	baseURL: APP_CONFIG.api.baseUrl,
	timeout: APP_CONFIG.api.timeoutMs,
	headers: {
		Accept: 'application/json',
	},
});

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


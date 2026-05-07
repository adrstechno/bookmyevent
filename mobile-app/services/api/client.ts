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
let authExpiredHandler: (() => void) | null = null;

export const setApiAuthToken = (token: string | null) => {
	bearerToken = token;
	// Sirf naya valid token aane par flag reset karo
	if (token) {
		tokenInvalidNotified = false;
	}
};

export const clearApiAuthToken = () => {
	bearerToken = null;
	// Flag reset mat karo — logout ke baad bhi protect karo
	// tokenInvalidNotified intentionally nahi reset ho raha
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

// Routes jahan 401/403 pe logout NAHI hona chahiye
const PUBLIC_ROUTES = [
	'/User/Login',
	'/User/InsertUser',
	'/User/forgot-password',
	'/User/reset-password',
	'/User/verify-email',
	'/User/resend-verification',
	'/User/verify-reset-token',
];

const isPublicRoute = (url: string | undefined): boolean => {
	if (!url) return false;
	return PUBLIC_ROUTES.some((route) => url.includes(route));
};

const normalizeApiError = (error: AxiosError): ApiError => {
	const status = error.response?.status ?? 0;
	const responseData = error.response?.data as
		| { message?: string; error?: string; code?: string; details?: unknown }
		| undefined;

	// Network error — no response received at all
	if (!error.response) {
		const isTimeout = error.code === 'ECONNABORTED';
		const isNetworkError = error.code === 'ERR_NETWORK' || error.message.includes('Network Error');
		
		if (isNetworkError || !error.code) {
			return {
				status: 0,
				message: 'No internet connection. Please check your network and try again.',
				isNetworkError: true,
			};
		}
		
		return {
			status: 0,
			message: isTimeout
				? 'Request timed out. Please check your connection and try again.'
				: 'Unable to connect to server. Please check your internet connection.',
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
		const url = error.config?.url;
		const responseData = error.response?.data as
			| { message?: string; requiresVerification?: boolean }
			| undefined;

		// Public routes (login/register) pe 401/403 se logout kabhi nahi hona chahiye
		const isVerificationRequired = Boolean(responseData?.requiresVerification);
		const isPublic = isPublicRoute(url);

		if (
			(status === 401 || status === 403) &&
			!isPublic &&
			!isVerificationRequired &&
			onTokenInvalid &&
			!tokenInvalidNotified
		) {
			tokenInvalidNotified = true;
			console.warn('[api] Token invalid/expired (status', status, 'url:', url, '). Logging out.');
			onTokenInvalid();
		}

		return Promise.reject(normalizeApiError(error));
	}
);

export const createRequestConfig = (config: AxiosRequestConfig = {}): AxiosRequestConfig => ({
	...config,
});

export default apiClient;
